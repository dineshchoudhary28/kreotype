"use client";

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Bar,
  ComposedChart,
} from "recharts";

interface ResultChartProps {
  wpmHistory: number[];
  rawHistory: number[];
  burstHistory: number[];
  errorHistory: number[];
  showWpm?: boolean;
  showRaw?: boolean;
  showBurst?: boolean;
  showErrors?: boolean;
}

export function ResultChart({
  wpmHistory,
  rawHistory,
  burstHistory,
  errorHistory,
  showWpm = true,
  showRaw = true,
  showBurst = false,
  showErrors = true,
}: ResultChartProps) {
  const data = wpmHistory.map((wpm, i) => ({
    second: i + 1,
    wpm: Math.round(wpm),
    raw: Math.round(rawHistory[i] ?? 0),
    burst: Math.round(burstHistory[i] ?? 0),
    errors: errorHistory[i] ?? 0,
  }));

  if (data.length === 0) return null;

  const maxErrors = Math.max(...data.map((d) => d.errors), 1);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--secondary)" opacity={0.2} />
          <XAxis
            dataKey="second"
            stroke="var(--secondary)"
            tick={{ fontSize: 11 }}
            label={{ value: "seconds", position: "insideBottom", offset: -5, fill: "var(--secondary)", fontSize: 11 }}
          />
          <YAxis yAxisId="wpm" stroke="var(--secondary)" tick={{ fontSize: 11 }} />
          <YAxis
            yAxisId="errors"
            orientation="right"
            domain={[0, maxErrors * 4]}
            hide
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--secondary)",
              borderRadius: 8,
              fontFamily: "monospace",
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, fontFamily: "monospace" }} />
          
          {showErrors && (
            <Bar
              yAxisId="errors"
              dataKey="errors"
              fill="var(--error)"
              opacity={0.5}
              barSize={8}
              name="errors"
            />
          )}
          
          {showWpm && (
            <Line
              yAxisId="wpm"
              type="monotone"
              dataKey="wpm"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={false}
              name="wpm"
            />
          )}
          
          {showRaw && (
            <Line
              yAxisId="wpm"
              type="monotone"
              dataKey="raw"
              stroke="var(--secondary)"
              strokeWidth={1}
              dot={false}
              strokeDasharray="4 4"
              name="raw"
            />
          )}

          {showBurst && (
            <Line
              yAxisId="wpm"
              type="monotone"
              dataKey="burst"
              stroke="var(--error-extra)"
              strokeWidth={1}
              dot={false}
              name="burst"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
