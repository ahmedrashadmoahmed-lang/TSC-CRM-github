import styles from './Table.module.css';

export default function Table({ columns, data, className = '' }) {
    return (
        <div className={`${styles.tableWrapper} ${className}`}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {columns.map((column, index) => (
                            <th key={index} className={styles.th}>
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {(Array.isArray(data) ? data : []).map((row, rowIndex) => (
                        <tr key={rowIndex} className={styles.tr}>
                            {columns.map((column, colIndex) => (
                                <td key={colIndex} className={styles.td}>
                                    {column.accessor ? row[column.accessor] : column.cell?.(row)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
