


const TableMain = ({ headers, body, page, setPage }) => {



    return <>
        <table className="main">
            <thead className="main">
                {
                    headers.map((header, index) =>
                        <tr key={index} className={`main_header ${header.type}`}>
                            {
                                header.columns.map((col, index) =>
                                    <th
                                        key={index}
                                        colSpan={col[1]}
                                        className={col[2]}
                                    >
                                        {col[0]}
                                    </th>
                                )
                            }
                        </tr>
                    )
                }
            </thead>
            {body}
        </table>
    </>
}

export default TableMain;