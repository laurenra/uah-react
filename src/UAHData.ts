export type UAHMonthlyRecord = {
  year: number;
  month: number;
  values: Record<string, number | null>;
};

export type UAHTrendRecord = {
  values: Record<string, number | null>;
};

export type UAHParsedData = {
  monthly: UAHMonthlyRecord[];
  trend: UAHTrendRecord | null;
  columns: string[];
};

export class UAHData {
  static readonly URL =
    "https://www.nsstc.uah.edu/data/msu/v6.1/tlt/uahncdc_lt_6.1.txt";

  static async downloadFile(url: string = UAHData.URL): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download UAH data: ${response.status}`);
    }
    return response.text();
  }

  static parseFile(text: string): UAHParsedData {
    const lines = text.split(/\r?\n/);
    let columns: string[] = [];
    const monthly: UAHMonthlyRecord[] = [];
    let trend: UAHTrendRecord | null = null;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      if (line.startsWith("NOTE:")) continue;
      if (line.startsWith("GL ") || line.startsWith("NoExt ")) continue;

      const parts = line.split(/\s+/);
      if (parts[0] === "Year" && parts[1] === "Mo") {
        columns = UAHData.buildColumns(parts.slice(2));
        continue;
      }

      if (parts[0] === "Trend") {
        trend = {
          values: UAHData.mapValues(columns, parts.slice(1)),
        };
        continue;
      }

      const year = Number(parts[0]);
      const month = Number(parts[1]);
      if (!Number.isFinite(year) || !Number.isFinite(month)) {
        continue;
      }

      monthly.push({
        year,
        month,
        values: UAHData.mapValues(columns, parts.slice(2)),
      });
    }

    return { monthly, trend, columns };
  }

  private static buildColumns(parts: string[]): string[] {
    const columns: string[] = [];
    let lastRegion: string | null = null;
    for (const part of parts) {
      if ((part === "Land" || part === "Ocean") && lastRegion) {
        columns.push(`${lastRegion}_${part}`);
        continue;
      }
      columns.push(part);
      lastRegion = part;
    }
    return columns;
  }

  private static mapValues(
    columns: string[],
    values: string[]
  ): Record<string, number | null> {
    const out: Record<string, number | null> = {};
    const length = Math.min(columns.length, values.length);
    for (let i = 0; i < length; i += 1) {
      const value = Number.parseFloat(values[i]);
      out[columns[i]] = Number.isFinite(value) ? value : null;
    }
    return out;
  }
}
