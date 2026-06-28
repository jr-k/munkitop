import styled from 'styled-components';

export const Container = styled.div`
  align-items: stretch;
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
`;

export const Toolbar = styled.div`
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  display: flex;
  gap: 12px;
  justify-content: flex-start;
  max-width: 100%;
  padding: 12px 14px;
  width: 100%;
`;

export const ToolbarTitle = styled.h2`
  color: #0f172a;
  font-size: 18px;
  margin: 0;
`;

export const ToolbarDescription = styled.p`
  color: #64748b;
  font-size: 13px;
  margin: 2px 0 0;
`;

export const FilterBar = styled.div`
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  max-width: 100%;
  padding: 14px;
  width: 100%;
`;

export const FilterTitle = styled.strong`
  color: #0f172a;
  display: block;
`;

export const FilterMeta = styled.span`
  color: #64748b;
  display: block;
  font-size: 13px;
  margin-top: 2px;
`;

export const FilterControl = styled.label`
  align-items: center;
  color: #334155;
  display: flex;
  font-size: 13px;
  font-weight: 700;
  gap: 10px;
`;

export const FilterControls = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-end;
  margin-left: auto;


  @media (max-width: 640px) {
    justify-content: flex-start;
    margin-left: 0;
    width: 100%;
  }
`;

export const FilterInput = styled.input`
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  color: #0f172a;
  padding: 9px 12px;
`;

export const TableCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  overflow: auto;
`;

export const Table = styled.table`
  border-collapse: collapse;
  min-width: 980px;
  width: 100%;

  th,
  td {
    border-bottom: 1px solid #e2e8f0;
    padding: 14px;
    text-align: left;
    vertical-align: middle;
  }

  th {
    background: #f8fafc;
    color: #475569;
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  tr:last-child td {
    border-bottom: 0;
  }
`;

export const CodePill = styled.code`
  background: #f1f5f9;
  border-radius: 999px;
  color: #334155;
  font-size: 12px;
  padding: 4px 8px;
`;

export const SortButton = styled.button`
  align-items: center;
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  font-weight: 800;
  letter-spacing: inherit;
  padding: 0;
  text-align: left;
  text-transform: inherit;

  &:hover {
    color: #0f172a;
  }
`;

export const LinkText = styled.a`
  color: #2563eb;
  font-weight: 800;
`;

export const Badge = styled.span<{ $expired: boolean }>`
  background: ${({ $expired }) => ($expired ? '#fee2e2' : '#dcfce7')};
  border-radius: 999px;
  color: ${({ $expired }) => ($expired ? '#991b1b' : '#166534')};
  font-size: 12px;
  font-weight: 800;
  padding: 4px 8px;
`;

export const RowActions = styled.div`
  display: flex;
  gap: 8px;
`;

export const Button = styled.button`
  background: #2563eb;
  border: 0;
  border-radius: 12px;
  color: #ffffff;
  font-weight: 800;
  padding: 11px 14px;
`;

export const SecondaryButton = styled.button`
  background: #eef2ff;
  border: 0;
  border-radius: 10px;
  color: #3730a3;
  font-weight: 700;
  padding: 9px 12px;
`;

export const DangerButton = styled.button`
  background: #fee2e2;
  border: 0;
  border-radius: 10px;
  color: #991b1b;
  font-weight: 700;
  padding: 9px 12px;
`;

export const TableIconButton = styled.button<{ $tone?: 'danger' | 'neutral' }>`
  align-items: center;
  background: ${({ $tone }) => ($tone === 'danger' ? '#fee2e2' : '#eef2ff')};
  border: 0;
  border-radius: 10px;
  color: ${({ $tone }) => ($tone === 'danger' ? '#991b1b' : '#3730a3')};
  display: inline-flex;
  height: 38px;
  justify-content: center;
  padding: 0;
  text-decoration: none;
  width: 38px;

  &:hover {
    background: ${({ $tone }) => ($tone === 'danger' ? '#fecaca' : '#e0e7ff')};
  }
`;

export const EmptyCell = styled.td`
  color: #64748b;
  text-align: center !important;
`;

export const ModalOverlay = styled.div`
  align-items: center;
  backdrop-filter: blur(8px);
  background: rgb(15 23 42 / 55%);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 24px;
  position: fixed;
  z-index: 100;
`;

export const Dialog = styled.div`
  background:
    radial-gradient(circle at top left, rgb(219 234 254 / 80%), transparent 34%),
    #ffffff;
  border-radius: 24px;
  box-shadow: 0 24px 80px rgb(15 23 42 / 28%);
  display: grid;
  gap: 20px;
  max-width: 560px;
  padding: 26px;
  width: min(100%, 560px);
`;

export const ModalHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: 18px;
  justify-content: space-between;
`;

export const ModalTitle = styled.h2`
  color: #0f172a;
  font-size: 22px;
  margin: 0;
`;

export const ModalDescription = styled.p`
  color: #64748b;
  line-height: 1.5;
  margin: 6px 0 0;
`;

export const IconButton = styled.button`
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  color: #334155;
  display: flex;
  flex: 0 0 auto;
  font-size: 22px;
  font-weight: 700;
  height: 36px;
  justify-content: center;
  line-height: 1;
  padding: 0 0 2px;
  width: 36px;
`;

export const Form = styled.form`
  display: grid;
  gap: 14px;
`;

export const Select = styled.select`
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  color: #0f172a;
  padding: 11px 12px;
`;

export const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;
