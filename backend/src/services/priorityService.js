// Deterministic Priority Algorithm

const calculatePriorityScore = (priority) => {
    switch (priority?.toUpperCase()) {
        case 'CRITICAL': return 4;
        case 'HIGH': return 3;
        case 'MEDIUM': return 2;
        case 'LOW': return 1;
        default: return 0;
    }
};

const calculateDeadlineScore = (deadline, status) => {
    if (!deadline) return 0;
    if (status === 'Completed') return 0; // Completed tasks don't get deadline urgency

    const now = new Date();
    // Normalize to start of day for accurate day diffs
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDate = new Date(deadline);
    const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

    const diffTime = dueDay - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 6; // Overdue
    if (diffDays === 0) return 5; // Due today
    if (diffDays === 1) return 4; // Due tomorrow
    if (diffDays <= 3) return 3; // Due within 3 days
    if (diffDays <= 7) return 2; // Due within 7 days
    return 1; // Due after 7 days
};

const calculateTotalScore = (priority, deadline, status) => {
    const pScore = calculatePriorityScore(priority);
    const dScore = calculateDeadlineScore(deadline, status);
    return {
        priorityScore: pScore,
        deadlineScore: dScore,
        totalScore: pScore + dScore
    };
};

module.exports = {
    calculatePriorityScore,
    calculateDeadlineScore,
    calculateTotalScore
};
