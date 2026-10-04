import React, { useMemo } from 'react';
import { useTable } from 'react-table';
import data from '../assets/air_quality_data.json';

const AirQualityTable = () => {
    // Define the columns based on JSON fields
    const columns = useMemo(
        () => [
            { Header: 'Country', accessor: 'country' },
            { Header: 'ISO3', accessor: 'iso3' },
            { Header: 'Region Name', accessor: 'region_name' },
            { Header: 'Year', accessor: 'year' },
            { Header: 'Pollutant NO2', accessor: 'pollutant_no2' },
            { Header: 'Exposure Mean NO2', accessor: 'exposure_mean_no2' },
            { Header: 'Pollutant Ozone', accessor: 'pollutant_ozone' },
            { Header: 'Exposure Mean Ozone', accessor: 'exposure_mean_ozone' },
            { Header: 'Pollutant PM2.5', accessor: 'pollutant_pm25' },
            { Header: 'Exposure Mean PM2.5', accessor: 'exposure_mean_pm25' },
            { Header: 'Health Burden Mean', accessor: 'health_burden_mean' },
            { Header: 'Units Health Burden Metric', accessor: 'units_health_burden_metric' },
            { Header: 'Units NO2', accessor: 'units_no2' },
            { Header: 'Units Ozone', accessor: 'units_ozone' },
            { Header: 'Units PM2.5', accessor: 'units_pm25' },
            { Header: 'Units Health Burden', accessor: 'units_health_burden' },
        ],
        []
    );

    const dataForTable = useMemo(() => data, []);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow
    } = useTable({ columns, data: dataForTable });

    return (
        <table {...getTableProps()} style={{ width: '100%', border: '1px solid black' }}>
            <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th {...column.getHeaderProps()} style={{ padding: '10px', border: '1px solid gray' }}>
                                {column.render('Header')}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map(row => {
                    prepareRow(row);
                    return (
                        <tr {...row.getRowProps()}>
                            {row.cells.map(cell => (
                                <td {...cell.getCellProps()} style={{ padding: '10px', border: '1px solid gray' }}>
                                    {cell.render('Cell')}
                                </td>
                            ))}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};

export default AirQualityTable;
