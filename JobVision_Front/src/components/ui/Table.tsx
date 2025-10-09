import {
    FC,
    ReactNode,
    HTMLAttributes,
    TdHTMLAttributes,
    ThHTMLAttributes,
} from "react";

type TableProps = HTMLAttributes<HTMLTableElement> & {
    children: ReactNode;
};

export const Table: FC<TableProps> = ({ children, className, ...rest }) => (
    <table
        className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${
            className || ""
        }`}
        {...rest}
    >
        {children}
    </table>
);

type TheadProps = HTMLAttributes<HTMLTableSectionElement> & {
    children: ReactNode;
};

export const TableHeader: FC<TheadProps> = ({ children, className, ...rest }) => (
    <thead className={`bg-gray-50 dark:bg-gray-700 ${className || ""}`} {...rest}>
    {children}
    </thead>
);

type TbodyProps = HTMLAttributes<HTMLTableSectionElement> & {
    children: ReactNode;
};

export const TableBody: FC<TbodyProps> = ({ children, className, ...rest }) => (
    <tbody
        className={`bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700 ${
            className || ""
        }`}
        {...rest}
    >
    {children}
    </tbody>
);

type TrProps = HTMLAttributes<HTMLTableRowElement> & {
    children: ReactNode;
};

export const TableRow: FC<TrProps> = ({ children, className, ...rest }) => (
    <tr className={className} {...rest}>
        {children}
    </tr>
);

type ThProps = ThHTMLAttributes<HTMLTableHeaderCellElement> & {
    children: ReactNode;
};

export const TableHead: FC<ThProps> = ({ children, className, ...rest }) => (
    <th
        scope="col"
        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400 ${
            className || ""
        }`}
        {...rest}
    >
        {children}
    </th>
);

type TdProps = TdHTMLAttributes<HTMLTableDataCellElement> & {
    children: ReactNode;
};

export const TableCell: FC<TdProps> = ({ children, className, ...rest }) => (
    <td
        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 ${
            className || ""
        }`}
        {...rest}
    >
        {children}
    </td>
);
