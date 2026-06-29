import styled from 'styled-components';

export const Container = styled.div`
  display: grid;
  gap: 18px;
`;

export const Toolbar = styled.div`
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 12px 14px;
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

export const Button = styled.button`
  background: #2563eb;
  border: 0;
  border-radius: 12px;
  color: #ffffff;
  font-weight: 800;
  padding: 11px 14px;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

export const SecondaryButton = styled(Button)`
  background: #e2e8f0;
  color: #0f172a;
`;

export const DangerButton = styled(Button)`
  background: #dc2626;
`;

export const TableCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
`;

export const Table = styled.table`
  border-collapse: collapse;
  width: 100%;
`;

export const Th = styled.th`
  background: #f8fafc;
  color: #475569;
  font-size: 12px;
  letter-spacing: 0.04em;
  padding: 12px;
  text-align: left;
  text-transform: uppercase;
`;

export const Td = styled.td`
  border-top: 1px solid #e2e8f0;
  color: #0f172a;
  padding: 12px;
  vertical-align: middle;
`;

export const RowActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const Badge = styled.span`
  background: #dbeafe;
  border-radius: 999px;
  color: #1d4ed8;
  display: inline-flex;
  font-size: 12px;
  font-weight: 800;
  padding: 4px 9px;
  text-transform: capitalize;
`;

export const PermissionList = styled.div`
  color: #475569;
  display: flex;
  flex-wrap: wrap;
  font-size: 13px;
  gap: 6px;
`;

export const PermissionChip = styled.span`
  background: #f1f5f9;
  border-radius: 999px;
  padding: 4px 8px;
`;

export const Overlay = styled.div`
  align-items: center;
  background: rgb(15 23 42 / 45%);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 20px;
  position: fixed;
  z-index: 50;
`;

export const Dialog = styled.div`
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 24px 70px rgb(15 23 42 / 25%);
  max-height: calc(100vh - 40px);
  max-width: 780px;
  overflow: auto;
  padding: 20px;
  width: 100%;
`;

export const DialogTitle = styled.h2`
  color: #0f172a;
  margin: 0 0 6px;
`;

export const DialogDescription = styled.p`
  color: #64748b;
  margin: 0 0 18px;
`;

export const Form = styled.form`
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

export const Full = styled.div`
  grid-column: 1 / -1;
`;

export const Input = styled.input`
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 11px 12px;
`;

export const Select = styled.select`
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 11px 12px;
`;

export const PermissionMatrix = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
`;

export const MatrixRow = styled.div`
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(120px, 1fr) repeat(2, minmax(90px, auto));
  padding: 10px 12px;

  & + & {
    border-top: 1px solid #e2e8f0;
  }
`;

export const MatrixHeader = styled(MatrixRow)`
  background: #f8fafc;
  color: #475569;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
`;

export const CheckboxLabel = styled.label`
  align-items: center;
  color: #334155;
  display: inline-flex;
  font-size: 13px;
  font-weight: 700;
  gap: 8px;
`;

export const DialogActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;
