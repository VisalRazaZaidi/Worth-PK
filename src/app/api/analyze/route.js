import { NextResponse } from "next/server";
import { SALARY_MAP_2026, COMPANY_PROFILES } from "@/lib/salaryData";

/**
 * POST /api/analyze
 * Accepts: { resumeText: string }
 * Returns: AI-powered market analysis of the resume
 */
export async function POST(request) {
    try {
        const { resumeText } = await request.json();

        if (!resumeText || resumeText.trim().length < 50) {
            return NextResponse.json(
                { error: "Resume text is too short or empty. Please upload a valid PDF." },
                { status: 400 }
            );
        }

        // Build the salary reference context
        const salaryContext = Object.entries(SALARY_MAP_2026)
            .map(([city, roles]) => {
                const roleLines = Object.entries(roles)
                    .map(([role, data]) => `    ${role}: PKR ${data.min.toLocaleString()}-${data.max.toLocaleString()} (avg: ${data.avg.toLocaleString()})`)
                    .join("\n");
                return `  ${city}:\n${roleLines}`;
            })
            .join("\n\n");

        // Build company reference context
        const companyContext = Object.entries(COMPANY_PROFILES)
            .map(([name, profile]) => {
                return `  ${name}:
    Description: ${profile.description}
    Required Skills: ${profile.requiredSkills.join(", ")}
    Nice-to-have: ${profile.niceToHave.join(", ")}
    Salary Range: PKR ${profile.avgSalary.min.toLocaleString()}-${profile.avgSalary.max.toLocaleString()}`;
            })
            .join("\n\n");

        const systemPrompt = `You are "Worth.pk AI Analyst" — a brutally honest Pakistani tech market analyst for CS graduates and early-career professionals.

Your job: Analyze the resume below and return a structured JSON assessment.

SALARY REFERENCE DATA (Pakistan 2026 Projected):
${salaryContext}

TOP COMPANY PROFILES:
${companyContext}

INSTRUCTIONS:
1. Identify all technical skills, frameworks, languages, and tools mentioned in the resume.
2. Determine the candidate's likely role (e.g., "Full Stack Developer", "Data Scientist", etc.).
3. Estimate their market value (monthly salary in PKR) for each city based on the reference data and their experience level.
4. Check which of the 3 companies (Systems Ltd, 10Pearls, Devsinc) the candidate's skills match with. A match means the candidate has at least 3 of the company's required skills.
5. Provide 3-5 specific, actionable recommendations to increase their market value.
6. Rate their overall "Market Readiness" from 1-100.

RESPOND ONLY WITH VALID JSON in this exact format (no markdown, no code fences):
{
  "candidateName": "extracted name or 'Unknown'",
  "detectedRole": "most likely role title",
  "experienceLevel": "Fresh Graduate | Junior (0-2 yrs) | Mid (2-5 yrs) | Senior (5+ yrs)",
  "skills": ["skill1", "skill2", ...],
  "marketReadiness": 72,
  "salaryEstimates": {
    "Karachi": { "min": 60000, "max": 150000, "predicted": 95000 },
    "Lahore": { "min": 55000, "max": 140000, "predicted": 85000 },
    "Islamabad": { "min": 65000, "max": 160000, "predicted": 100000 }
  },
  "companyMatches": {
    "Systems Ltd": { "matched": true, "matchedSkills": ["React", "SQL"], "missingSkills": ["Java", "Spring Boot"], "matchScore": 45 },
    "10Pearls": { "matched": true, "matchedSkills": ["React", "Node.js", "AWS"], "missingSkills": ["Flutter"], "matchScore": 70 },
    "Devsinc": { "matched": false, "matchedSkills": ["React"], "missingSkills": ["Ruby on Rails", "PostgreSQL"], "matchScore": 25 }
  },
  "recommendations": [
    "Learn Docker and Kubernetes to boost DevOps readiness",
    "Build a portfolio project with Next.js for 10Pearls",
    "Get AWS Cloud Practitioner certification"
  ],
  "summary": "A 2-3 sentence brutally honest assessment of the candidate's position in the Pakistani tech market."
}`;

        const userPrompt = `Analyze this resume:\n\n${resumeText.substring(0, 8000)}`;

        // Try Gemini first, then fall back to OpenAI
        let result;

        if (process.env.GEMINI_API_KEY) {
            result = await callGemini(systemPrompt, userPrompt);
        } else if (process.env.OPENAI_API_KEY) {
            result = await callOpenAI(systemPrompt, userPrompt);
        } else {
            // Return mock data for demo/development
            result = getMockAnalysis(resumeText);
        }

        return NextResponse.json({ analysis: result });
    } catch (error) {
        console.error("Analysis error:", error);
        return NextResponse.json(
            { error: "Analysis failed: " + error.message },
            { status: 500 }
        );
    }
}

/**
 * Call Google Gemini API
 */
async function callGemini(systemPrompt, userPrompt) {
    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: systemPrompt + "\n\n" + userPrompt }],
                    },
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                    responseMimeType: "application/json",
                },
            }),
        }
    );

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("Empty response from Gemini");
    return JSON.parse(text);
}

/**
 * Call OpenAI API
 */
async function callOpenAI(systemPrompt, userPrompt) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 2048,
            response_format: { type: "json_object" },
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) throw new Error("Empty response from OpenAI");
    return JSON.parse(text);
}

/**
 * Mock analysis for demo/development when no API key is configured
 */
function getMockAnalysis(resumeText) {
    const textLower = resumeText.toLowerCase();

    // Simple skill detection from resume text
    const allSkills = [
        "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Ruby",
        "React", "Angular", "Vue.js", "Next.js", "Node.js", "Express",
        "Django", "Flask", "Spring Boot", ".NET", "Ruby on Rails",
        "HTML", "CSS", "Tailwind", "Bootstrap",
        "MongoDB", "PostgreSQL", "MySQL", "SQL", "Redis", "Firebase",
        "AWS", "Azure", "GCP", "Docker", "Kubernetes",
        "Git", "Linux", "REST API", "GraphQL",
        "Machine Learning", "TensorFlow", "PyTorch", "Data Science",
        "React Native", "Flutter", "Swift",
        "CI/CD", "Agile", "Scrum",
    ];

    const detectedSkills = allSkills.filter((skill) =>
        textLower.includes(skill.toLowerCase())
    );

    if (detectedSkills.length === 0) {
        detectedSkills.push("JavaScript", "HTML", "CSS");
    }

    // Determine role
    let role = "Software Engineer (General)";
    if (textLower.includes("machine learning") || textLower.includes("data science") || textLower.includes("tensorflow")) {
        role = "Machine Learning Engineer";
    } else if (textLower.includes("react") && textLower.includes("node")) {
        role = "Full Stack Developer";
    } else if (textLower.includes("react") || textLower.includes("frontend") || textLower.includes("front-end")) {
        role = "Frontend Developer";
    } else if (textLower.includes("python") && textLower.includes("django")) {
        role = "Backend Developer";
    } else if (textLower.includes("devops") || textLower.includes("docker") || textLower.includes("kubernetes")) {
        role = "DevOps Engineer";
    } else if (textLower.includes("mobile") || textLower.includes("flutter") || textLower.includes("react native")) {
        role = "Mobile App Developer";
    }

    // Experience detection
    let experience = "Fresh Graduate";
    if (textLower.includes("senior") || textLower.includes("lead") || textLower.includes("5+ years") || textLower.includes("7 years")) {
        experience = "Senior (5+ yrs)";
    } else if (textLower.includes("3 years") || textLower.includes("4 years") || textLower.includes("mid")) {
        experience = "Mid (2-5 yrs)";
    } else if (textLower.includes("1 year") || textLower.includes("2 years") || textLower.includes("junior") || textLower.includes("intern")) {
        experience = "Junior (0-2 yrs)";
    }

    const readiness = Math.min(95, Math.max(25, detectedSkills.length * 7 + 20));

    // Build company matches
    const companyMatches = {};
    for (const [name, profile] of Object.entries(COMPANY_PROFILES)) {
        const matchedSkills = profile.requiredSkills.filter((s) =>
            detectedSkills.some((ds) => ds.toLowerCase() === s.toLowerCase())
        );
        const missingSkills = profile.requiredSkills
            .filter((s) => !detectedSkills.some((ds) => ds.toLowerCase() === s.toLowerCase()))
            .slice(0, 4);
        const matchScore = Math.round((matchedSkills.length / profile.requiredSkills.length) * 100);

        companyMatches[name] = {
            matched: matchedSkills.length >= 3,
            matchedSkills,
            missingSkills,
            matchScore,
        };
    }

    // Salary estimates
    const multiplier = experience === "Senior (5+ yrs)" ? 1.6 : experience === "Mid (2-5 yrs)" ? 1.2 : experience === "Junior (0-2 yrs)" ? 0.85 : 0.65;

    const salaryEstimates = {};
    for (const city of ["Karachi", "Lahore", "Islamabad"]) {
        const ref = SALARY_MAP_2026[city][role] || SALARY_MAP_2026[city]["Software Engineer (General)"];
        salaryEstimates[city] = {
            min: Math.round(ref.min * multiplier),
            max: Math.round(ref.max * multiplier),
            predicted: Math.round(ref.avg * multiplier),
        };
    }

    return {
        candidateName: "Candidate",
        detectedRole: role,
        experienceLevel: experience,
        skills: detectedSkills,
        marketReadiness: readiness,
        salaryEstimates,
        companyMatches,
        recommendations: [
            "Add Docker & Kubernetes to your skillset — DevOps knowledge is a massive salary multiplier in Pakistan's 2026 market",
            "Build 2-3 production-grade portfolio projects on GitHub with proper READMEs and live demos",
            "Get an AWS Cloud Practitioner or Azure Fundamentals certification — remote-friendly companies prioritize this",
            "Contribute to open-source projects to stand out from the crowd of Pakistani CS graduates",
            "Learn system design fundamentals — this is the #1 gap in most Pakistani developers' interviews",
        ],
        summary: `Based on ${detectedSkills.length} detected skills, this candidate profiles as a ${role} at the ${experience} level. In Pakistan's 2026 market, their strongest opportunity is in Islamabad where tech salaries are highest. To maximize market value, focusing on cloud certifications and building a strong GitHub presence would be the highest-ROI moves.`,
    };
}
