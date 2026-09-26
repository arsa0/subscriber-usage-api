-- 1. Insert a new subscribers: Fajar, Basic, 24 January 2024
-- SUB07 follows existing pattern
INSERT INTO
    subscribers (id, name, plan, activationDate)
VALUES
    ('SUB07', 'Fajar', 'Basic', '2024-01-24');

-- 2. Update Fajar's plan to 'Premium'
UPDATE subscribers
SET
    plan = 'Premium'
WHERE
    id = 'SUB07';

-- 3. Calculate total data usage for all premium users
SELECT
    SUM(u.dataUsageMB) AS totalUsage
FROM
    usage u
    JOIN subscribers s ON u.subscriberId = s.id
WHERE
    s.plan = 'Premium';

-- 4. sort and display top 3 subscribers by total data usage across all snapshots
SELECT
    s.name,
    s.plan,
    SUM(u.dataUsageMB) as totalDataUsage
FROM
    subscribers s
    JOIN usage u ON u.subscriberId = s.id
GROUP BY
    s.name,
    s.plan
ORDER BY
    totalDataUsage DESC
LIMIT
    3;

-- 5. write a subquery to find subscriber's avg call minute less than or equal to 30
SELECT
    s.name,
    s.plan,
    acm.averageCallMinutes
FROM
    subscribers s
    INNER JOIN (
        SELECT
            AVG(callMinutes) AS averageCallMinutes,
            subscriberId
        FROM
            usage
        GROUP BY
            subscriberId
        HAVING
            AVG(callMinutes) <= 30
    ) AS acm ON s.id = acm.subscriberId;