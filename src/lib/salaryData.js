/**
 * Hardcoded Salary Map for Pakistan CS Market - 2026 Projections
 * Reference data for the AI "Market Analyst" predictions.
 */

export const SALARY_MAP_2026 = {
    Karachi: {
        "Frontend Developer": { min: 60000, max: 150000, avg: 95000 },
        "Backend Developer": { min: 70000, max: 180000, avg: 110000 },
        "Full Stack Developer": { min: 80000, max: 200000, avg: 130000 },
        "React Developer": { min: 70000, max: 170000, avg: 105000 },
        "Python Developer": { min: 75000, max: 190000, avg: 120000 },
        "Data Scientist": { min: 90000, max: 250000, avg: 155000 },
        "Machine Learning Engineer": { min: 100000, max: 280000, avg: 170000 },
        "DevOps Engineer": { min: 85000, max: 220000, avg: 140000 },
        "Mobile App Developer": { min: 65000, max: 180000, avg: 110000 },
        "Cloud Engineer": { min: 90000, max: 240000, avg: 150000 },
        "QA Engineer": { min: 50000, max: 130000, avg: 80000 },
        "UI/UX Designer": { min: 55000, max: 140000, avg: 85000 },
        "Cybersecurity Analyst": { min: 80000, max: 200000, avg: 130000 },
        "Blockchain Developer": { min: 100000, max: 300000, avg: 180000 },
        "AI Engineer": { min: 110000, max: 320000, avg: 190000 },
        "Software Engineer (General)": { min: 65000, max: 180000, avg: 110000 },
        "Fresh Graduate (CS)": { min: 40000, max: 80000, avg: 55000 },
    },
    Lahore: {
        "Frontend Developer": { min: 55000, max: 140000, avg: 85000 },
        "Backend Developer": { min: 65000, max: 170000, avg: 100000 },
        "Full Stack Developer": { min: 75000, max: 190000, avg: 120000 },
        "React Developer": { min: 65000, max: 160000, avg: 100000 },
        "Python Developer": { min: 70000, max: 180000, avg: 110000 },
        "Data Scientist": { min: 85000, max: 240000, avg: 145000 },
        "Machine Learning Engineer": { min: 95000, max: 270000, avg: 160000 },
        "DevOps Engineer": { min: 80000, max: 210000, avg: 130000 },
        "Mobile App Developer": { min: 60000, max: 170000, avg: 100000 },
        "Cloud Engineer": { min: 85000, max: 230000, avg: 140000 },
        "QA Engineer": { min: 45000, max: 120000, avg: 72000 },
        "UI/UX Designer": { min: 50000, max: 130000, avg: 78000 },
        "Cybersecurity Analyst": { min: 75000, max: 190000, avg: 120000 },
        "Blockchain Developer": { min: 95000, max: 290000, avg: 170000 },
        "AI Engineer": { min: 105000, max: 310000, avg: 180000 },
        "Software Engineer (General)": { min: 60000, max: 170000, avg: 100000 },
        "Fresh Graduate (CS)": { min: 35000, max: 75000, avg: 50000 },
    },
    Islamabad: {
        "Frontend Developer": { min: 65000, max: 160000, avg: 100000 },
        "Backend Developer": { min: 75000, max: 195000, avg: 120000 },
        "Full Stack Developer": { min: 85000, max: 220000, avg: 140000 },
        "React Developer": { min: 75000, max: 180000, avg: 115000 },
        "Python Developer": { min: 80000, max: 200000, avg: 125000 },
        "Data Scientist": { min: 95000, max: 270000, avg: 165000 },
        "Machine Learning Engineer": { min: 110000, max: 300000, avg: 185000 },
        "DevOps Engineer": { min: 90000, max: 240000, avg: 150000 },
        "Mobile App Developer": { min: 70000, max: 190000, avg: 115000 },
        "Cloud Engineer": { min: 95000, max: 260000, avg: 160000 },
        "QA Engineer": { min: 55000, max: 140000, avg: 85000 },
        "UI/UX Designer": { min: 60000, max: 150000, avg: 90000 },
        "Cybersecurity Analyst": { min: 85000, max: 220000, avg: 140000 },
        "Blockchain Developer": { min: 110000, max: 320000, avg: 195000 },
        "AI Engineer": { min: 120000, max: 350000, avg: 210000 },
        "Software Engineer (General)": { min: 70000, max: 195000, avg: 120000 },
        "Fresh Graduate (CS)": { min: 45000, max: 90000, avg: 60000 },
    },
};

/**
 * Top Pakistani tech companies and their typical stacks
 */
export const COMPANY_PROFILES = {
    "Systems Ltd": {
        description: "Pakistan's largest IT services company. Enterprise solutions, digital transformation.",
        requiredSkills: ["Java", "Spring Boot", ".NET", "C#", "SQL", "Oracle", "SAP", "Angular", "React"],
        niceToHave: ["AWS", "Azure", "Docker", "Microservices", "Agile"],
        avgSalary: { min: 70000, max: 200000 },
        icon: "🖥️",
        color: "#0066cc",
    },
    "10Pearls": {
        description: "Product engineering company. AI, mobile, web applications.",
        requiredSkills: ["React", "Node.js", "Python", "JavaScript", "TypeScript", "AWS", "React Native", "Flutter"],
        niceToHave: ["GraphQL", "Docker", "Kubernetes", "MongoDB", "PostgreSQL", "CI/CD"],
        avgSalary: { min: 80000, max: 250000 },
        icon: "💎",
        color: "#e91e63",
    },
    Devsinc: {
        description: "Custom software development. Web, mobile, cloud solutions.",
        requiredSkills: ["Ruby on Rails", "React", "Node.js", "Python", "JavaScript", "PostgreSQL", "AWS"],
        niceToHave: ["Docker", "Redis", "ElasticSearch", "GraphQL", "TypeScript", "Next.js"],
        avgSalary: { min: 75000, max: 220000 },
        icon: "🚀",
        color: "#ff6f00",
    },
};

/**
 * Format a PKR salary value
 */
export function formatPKR(amount) {
    if (!amount) return "PKR ---";
    return "PKR " + Number(amount).toLocaleString("en-PK");
}
