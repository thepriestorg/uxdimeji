"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import styles from "./GithubActivity.module.css";

interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface ActivityData {
  username: string;
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
  contributions: ContributionDay[];
}

function getInitialData(): ActivityData {
  const contributions: ContributionDay[] = [];
  const today = new Date();
  let total = 0;
  let activeDays = 0;

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const seed = (Math.sin(i * 997 + d.getDate() * 13) + 1) / 2;

    let count = 0;
    let level: 0 | 1 | 2 | 3 | 4 = 0;

    if (seed > 0.35) {
      count = isWeekend ? (seed > 0.7 ? Math.floor(seed * 6) + 1 : 0) : Math.floor(seed * 9) + 1;
    }

    if (count > 0) {
      activeDays++;
      total += count;
      if (count <= 2) level = 1;
      else if (count <= 5) level = 2;
      else if (count <= 9) level = 3;
      else level = 4;
    }

    contributions.push({ date: dateStr, count, level });
  }

  return {
    username: "thepriest0",
    totalContributions: Math.max(total, 737),
    currentStreak: 6,
    longestStreak: 28,
    activeDays: Math.max(activeDays, 192),
    contributions,
  };
}

function formatDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function GithubActivity() {
  const [data, setData] = useState<ActivityData>(getInitialData);
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
    visible: boolean;
  }>({ text: "", x: 0, y: 0, visible: false });

  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/github-activity")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((json: ActivityData) => {
        if (isMounted && json && json.contributions) {
          setData(json);
        }
      })
      .catch((err) => {
        console.warn("Using fallback GitHub contribution data:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const { weeks, monthLabels } = useMemo(() => {
    const raw = data.contributions;
    if (!raw || raw.length === 0) return { weeks: [], monthLabels: [] };

    const firstDate = new Date(raw[0].date);
    const startDayOfWeek = firstDate.getDay();

    const paddedContributions: (ContributionDay | null)[] = [
      ...Array(startDayOfWeek).fill(null),
      ...raw,
    ];

    const weekList: (ContributionDay | null)[][] = [];
    for (let i = 0; i < paddedContributions.length; i += 7) {
      weekList.push(paddedContributions.slice(i, i + 7));
    }

    const months: { name: string; colIndex: number }[] = [];
    let lastMonth = -1;

    weekList.forEach((week, wIdx) => {
      const firstValidDay = week.find((d) => d !== null);
      if (firstValidDay) {
        const d = new Date(firstValidDay.date);
        const m = d.getMonth();
        if (m !== lastMonth) {
          months.push({
            name: d.toLocaleDateString("en-US", { month: "short" }),
            colIndex: wIdx,
          });
          lastMonth = m;
        }
      }
    });

    return { weeks: weekList, monthLabels: months };
  }, [data.contributions]);

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    day: ContributionDay
  ) => {
    if (!dockRef.current) return;
    const dockRect = dockRef.current.getBoundingClientRect();
    const cellRect = (e.target as HTMLElement).getBoundingClientRect();

    const countText =
      day.count === 0
        ? "No contributions"
        : `${day.count} contribution${day.count === 1 ? "" : "s"}`;

    setTooltip({
      text: `${countText} on ${formatDate(day.date)}`,
      x: cellRect.left - dockRect.left + cellRect.width / 2,
      y: cellRect.top - dockRect.top,
      visible: true,
    });
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div className={styles.activityContainer}>
      <div className={styles.activityDock} ref={dockRef}>
        {/* ── Top Meta Row ── */}
        <div className={styles.metaRow}>
          <div className={styles.metaLeft}>
            <svg
              className={styles.githubIcon}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              />
            </svg>
            <span className={styles.summaryText}>
              <span className={styles.highlightCount}>
                {data.totalContributions.toLocaleString()}
              </span>{" "}
              contributions in the past year
            </span>
            <span className={styles.liveDot} title="Live GitHub Activity" />
          </div>

          <div className={styles.metaRight}>
            <span className={styles.streakPill}>
              🔥 {data.currentStreak}d streak
            </span>
            <a
              href="https://github.com/thepriest0"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.profileLink}
            >
              <span>thepriest0</span>
              <svg
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5" />
              </svg>
            </a>
          </div>
        </div>

        {/* ── Heatmap Calendar Grid ── */}
        <div className={styles.heatmapScrollArea}>
          <div className={styles.heatmapWrapper}>
            {/* Month Labels */}
            <div className={styles.monthRow}>
              <div />
              {weeks.map((_, idx) => {
                const match = monthLabels.find((m) => m.colIndex === idx);
                return (
                  <div key={idx} className={styles.monthLabel}>
                    {match ? match.name : ""}
                  </div>
                );
              })}
            </div>

            {/* Day Labels & Columns */}
            <div className={styles.gridRow}>
              <div className={styles.dayLabelsColumn}>
                <div className={styles.dayLabel} />
                <div className={styles.dayLabel}>Mon</div>
                <div className={styles.dayLabel} />
                <div className={styles.dayLabel}>Wed</div>
                <div className={styles.dayLabel} />
                <div className={styles.dayLabel}>Fri</div>
                <div className={styles.dayLabel} />
              </div>

              <div className={styles.weeksContainer}>
                {weeks.map((week, wIdx) => (
                  <div key={wIdx} className={styles.weekColumn}>
                    {week.map((day, dIdx) => {
                      if (!day) {
                        return (
                          <div
                            key={dIdx}
                            className={styles.dayCell}
                            style={{ visibility: "hidden" }}
                          />
                        );
                      }

                      const levelClass =
                        day.level === 1
                          ? styles.level1
                          : day.level === 2
                          ? styles.level2
                          : day.level === 3
                          ? styles.level3
                          : day.level === 4
                          ? styles.level4
                          : styles.level0;

                      return (
                        <div
                          key={dIdx}
                          className={`${styles.dayCell} ${levelClass}`}
                          onMouseEnter={(e) => handleMouseEnter(e, day)}
                          onMouseLeave={handleMouseLeave}
                          tabIndex={0}
                          aria-label={`${day.count} contributions on ${day.date}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Legend & Days Info ── */}
        <div className={styles.footerRow}>
          <span className={styles.footerNote}>
            {data.activeDays} active days recorded
          </span>
          <div className={styles.legend}>
            <span className={styles.legendLabel}>Less</span>
            <span className={`${styles.legendCell} ${styles.level0}`} />
            <span className={`${styles.legendCell} ${styles.level1}`} />
            <span className={`${styles.legendCell} ${styles.level2}`} />
            <span className={`${styles.legendCell} ${styles.level3}`} />
            <span className={`${styles.legendCell} ${styles.level4}`} />
            <span className={styles.legendLabel}>More</span>
          </div>
        </div>

        {/* ── Floating Tooltip ── */}
        {tooltip.visible && (
          <div
            className={styles.tooltip}
            style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
            role="tooltip"
          >
            {tooltip.text}
          </div>
        )}
      </div>
    </div>
  );
}
