//Componente para exportar PDFs

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

interface PDFReportProps {
  title: string;
  subtitle?: string;
  generatedDate?: string;
  data: any[];
  columns: {
    key: string;
    label: string;
    format?: (value: any) => string;
  }[];
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#5FA92C",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#5FA92C",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  metadata: {
    fontSize: 10,
    color: "#999",
    marginTop: 10,
  },
  table: {
    marginTop: 15,
    marginBottom: 20,
  },
  tableHeader: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#5FA92C",
    color: "white",
    fontWeight: "bold",
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    wordWrap: "break-word",
  },
  summary: {
    backgroundColor: "#F2FAEC",
    padding: 10,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#5FA92C",
  },
  summaryText: {
    fontSize: 12,
    color: "#333",
    marginBottom: 5,
  },
});

// Componente del PDF
function ReportPDF({ title, subtitle, generatedDate, data, columns }: PDFReportProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          <Text style={styles.metadata}>
            Generado: {generatedDate || new Date().toLocaleDateString("es-AR")}
          </Text>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            Total de registros: <Text style={{ fontWeight: "bold" }}>{data.length}</Text>
          </Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            {columns.map((col) => (
              <View key={col.key} style={[styles.tableCell, { flex: col.key === columns[0].key ? 1.5 : 1 }]}>
                <Text>{col.label}</Text>
              </View>
            ))}
          </View>

          {/* Table Rows */}
          {data.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.tableRow}>
              {columns.map((col) => (
                <View
                  key={`${rowIndex}-${col.key}`}
                  style={[styles.tableCell, { flex: col.key === columns[0].key ? 1.5 : 1 }]}
                >
                  <Text>
                    {col.format ? col.format(row[col.key]) : row[col.key] || "—"}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}

// Botón de descarga reutilizable
export function PDFDownloadButton({
  title,
  subtitle,
  data,
  columns,
  filename = "reporte",
  disabled = false,
}: {
  title: string;
  subtitle?: string;
  data: any[];
  columns: any[];
  filename?: string;
  disabled?: boolean;
}) {
  return (
    <PDFDownloadLink
      document={
        <ReportPDF
          title={title}
          subtitle={subtitle}
          data={data}
          columns={columns}
          generatedDate={new Date().toLocaleDateString("es-AR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        />
      }
      fileName={`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`}
    >
      {({ loading }) => (
        <button
          disabled={loading || disabled || data.length === 0}
          className={`
            px-4 py-2 rounded-md text-white font-semibold
            ${
              !loading && !disabled && data.length > 0
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-300 cursor-not-allowed"
            }
          `}
        >
          {loading ? "Generando PDF..." : "📥 Descargar PDF"}
        </button>
      )}
    </PDFDownloadLink>
  );
}

export default ReportPDF;