import { round, score } from './score.js';

const dir = 'https://proyecto-skl.github.io/data';
const challengesDir = 'https://proyecto-skl.github.io/data/datachallenges';

export async function fetchMapPacks() {
    try {
        const mapPacksResults = await fetch(`${dir}/_mappacks.json`);
        return await mapPacksResults.json();
    } catch { return null; }
}

export async function fetchList() { return await fetchAnyList(dir); }
export async function fetchChallengesList() { return await fetchAnyList(challengesDir); }

async function fetchAnyList(basePath) {
    try {
        const listResult = await fetch(`${basePath}/_list.json`);
        if (!listResult.ok) return null;
        const list = await listResult.json();
        return await Promise.all(
            list.map(async (path) => {
                try {
                    const levelResult = await fetch(`${basePath}/${path.trim()}.json`);
                    if (!levelResult.ok) throw new Error("404");
                    const level = await levelResult.json();
                    return [level, null];
                } catch (e) { return [null, path]; }
            })
        );
    } catch { return null; }
}

export async function fetchLeaderboard() {
    const list = await fetchList();
    const challengesList = await fetchChallengesList();
    const scoreMap = {};
    const errs = [];

    if (list) {
        list.forEach(([level, err], rank) => {
            if (err || !level) { if (err) errs.push(err); return; }
            (level.records || []).forEach((record) => {
                const user = record.user;
                scoreMap[user] ??= { completed: [], progressed: [], challenges: [] };
                if (record.percent === 100) {
                    scoreMap[user].completed.push({
                        rank: rank + 1,
                        level: level.name,
                        score: score(rank + 1, 100, level.percentToQualify),
                        link: record.link,
                    });
                } else {
                    scoreMap[user].progressed.push({
                        rank: rank + 1,
                        level: level.name,
                        percent: record.percent,
                        score: score(rank + 1, record.percent, level.percentToQualify),
                        link: record.link,
                    });
                }
            });
        });
    }

    if (challengesList) {
        challengesList.forEach(([level, err], rank) => {
            if (err || !level) return;
            const challengeScore = round(score(rank + 1, 100, level.percentToQualify) / 5);
            (level.records || []).forEach((record) => {
                const user = record.user;
                scoreMap[user] ??= { completed: [], progressed: [], challenges: [] };
                if (record.percent === 100) {
                    scoreMap[user].challenges.push({
                        rank: rank + 1,
                        level: level.name,
                        score: challengeScore,
                        link: record.link,
                    });
                }
            });
        });
    }

    const res = Object.entries(scoreMap).map(([user, scores]) => {
        const total = [...scores.completed, ...scores.progressed, ...scores.challenges]
            .reduce((prev, cur) => prev + cur.score, 0);
        return { user, total: round(total), ...scores };
    });

    return [res.sort((a, b) => b.total - a.total), errs];
}
