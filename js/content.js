import { round, score } from './score.js';

const dir = 'https://proyecto-skl.github.io/data';
const challengesDir = 'https://proyecto-skl.github.io/data/datachallenges';

export async function fetchMapPacks() {
    try {
        const mapPacksResults = await fetch(`${dir}/_mappacks.json`);
        return await mapPacksResults.json();
    } catch {
        return null;
    }
}

export async function fetchEditors() {
    try {
        const editorsResults = await fetch(`${dir}/_editors.json`);
        return await editorsResults.json();
    } catch {
        return null;
    }
}

export async function fetchList() {
    return await fetchAnyList(dir);
}

export async function fetchChallengesList() {
    return await fetchAnyList(challengesDir);
}

async function fetchAnyList(basePath) {
    try {
        const listResult = await fetch(`${basePath}/_list.json`);
        if (!listResult.ok) return null;

        const list = await listResult.json();
        const mapPacks = await fetchMapPacks() || {};
        
        return await Promise.all(
            list.map(async (path) => {
                try {
                    const levelResult = await fetch(`${basePath}/${path.trim()}.json`);
                    if (!levelResult.ok) throw new Error("404");
                    const level = await levelResult.json();

                    if (level.mapPack && mapPacks[level.mapPack]) {
                        const packInfo = mapPacks[level.mapPack];
                        level.mapPackPrettyName = packInfo.prettyName;
                        level.mapPackColor = packInfo.color;
                    }

                    return [
                        {
                            ...level,
                            path,
                            records: (level.records || []).sort((a, b) => b.percent - a.percent),
                        },
                        null,
                    ];
                } catch (err) {
                    return [null, path];
                }
            })
        );
    } catch (err) {
        return null;
    }
}

export async function fetchLeaderboard() {
    const list = await fetchList();
    const challengesList = await fetchChallengesList();
    
    if (!list) return [null, ['Failed to load list']];

    const scoreMap = {};
    const errs = [];

    // 1. Procesar niveles normales
    list.forEach(([level, err], rank) => {
        if (err || !level) return;
        
        // --- SE HA ELIMINADO LA SECCIÓN DE VERIFIER AQUÍ ---

        (level.records || []).forEach((record) => {
            const user = record.user;
            scoreMap[user] ??= { verified: [], completed: [], progressed: [], challenges: [] };
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

    // 2. Procesar challenges
    if (challengesList) {
        challengesList.forEach(([level, err], rank) => {
            if (err || !level) return;

            // Los challenges dan el 20% de puntos (dividido por 5)
            const challengeScore = round(score(rank + 1, 100, level.percentToQualify) / 5);

            // --- SE HA ELIMINADO LA SECCIÓN DE VERIFIER AQUÍ TAMBIÉN ---

            (level.records || []).forEach((record) => {
                const user = record.user;
                scoreMap[user] ??= { verified: [], completed: [], progressed: [], challenges: [] };
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
        // Ahora solo sumamos completed, progressed y challenges (verified estará siempre vacío)
        const total = [...scores.completed, ...scores.progressed, ...scores.challenges]
            .reduce((prev, cur) => prev + cur.score, 0);
        return { user, total: round(total), ...scores };
    });

    // Filtramos para no mostrar usuarios que tengan 0 puntos (por si acaso)
    const filteredRes = res.filter(entry => entry.total > 0);

    return [filteredRes.sort((a, b) => b.total - a.total), errs];
}
