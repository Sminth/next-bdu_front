/**
 * Exporte un tableau de données en fichier CSV ouvrable dans Excel.
 * Le BOM UTF-8 (\uFEFF) garantit l'affichage correct des caractères français.
 */
export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data.length) return;

  const headers = Object.keys(data[0]);

  const escape = (val: any): string => {
    if (val === null || val === undefined) return "";
    const str = String(val);
    if (str.includes(";") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = [
    headers.map(escape).join(";"),
    ...data.map((row) => headers.map((h) => escape(row[h])).join(";")),
  ].join("\r\n");

  // BOM pour Excel (UTF-8)
  const blob = new Blob(["\uFEFF" + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
