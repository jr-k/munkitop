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

export const ChipDropdown = styled.div`
  position: relative;
`;

export const FilterDropdown = styled(ChipDropdown)`
  min-width: 280px;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

export const ChipTrigger = styled.button`
  align-items: center;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  min-height: 43px;
  padding: 8px 10px;
  text-align: left;
  width: 100%;
`;

export const Placeholder = styled.span`
  color: #94a3b8;
`;

export const ChipList = styled.span`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const Chip = styled.span`
  align-items: center;
  background: #dbeafe;
  border-radius: 999px;
  color: #1d4ed8;
  display: inline-flex;
  font-size: 12px;
  font-weight: 700;
  gap: 5px;
  padding: 4px 9px;
`;

export const Caret = styled.span`
  color: #64748b;
  flex: 0 0 auto;
  font-size: 12px;
  padding-left: 10px;
`;

export const DropdownMenu = styled.div`
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  box-shadow: 0 14px 30px rgb(15 23 42 / 12%);
  display: grid;
  gap: 8px;
  left: 0;
  margin-top: 6px;
  padding: 6px;
  position: absolute;
  right: 0;
  z-index: 20;
`;

export const DropdownSearch = styled.input`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #0f172a;
  padding: 9px 10px;
`;

export const DropdownList = styled.div`
  display: grid;
  gap: 4px;
  max-height: 260px;
  overflow: auto;
`;

export const DropdownOption = styled.button<{ $selected: boolean }>`
  align-items: center;
  background: ${({ $selected }) => ($selected ? '#eff6ff' : '#ffffff')};
  border: 0;
  border-radius: 9px;
  color: #0f172a;
  display: flex;
  font-weight: ${({ $selected }) => ($selected ? 700 : 500)};
  justify-content: space-between;
  padding: 9px 10px;
  text-align: left;

  &:hover {
    background: #f1f5f9;
  }
`;

export const TargetOption = styled.span`
  align-items: center;
  display: flex;
  gap: 10px;
  min-width: 0;
`;

export const OptionLabel = styled.span`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const OptionEyebrow = styled.span`
  color: #64748b;
  display: block;
  font-size: 12px;
  font-weight: 600;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SelectionSummary = styled.span`
  align-items: center;
  display: flex;
  min-width: 0;
`;

export const TableCard = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  overflow: auto;
`;

export const Table = styled.table`
  border-collapse: collapse;
  min-width: 900px;
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

export const LinkField = styled.div`
  align-items: center;
  display: flex;
  gap: 6px;
  width: 190px;
`;

export const LinkInput = styled.input`
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  color: #0f172a;
  flex: 1;
  font: inherit;
  font-size: 12px;
  min-width: 0;
  padding: 7px 9px;
`;

export const TargetCell = styled.div`
  display: grid;
  gap: 7px;
`;

export const TargetName = styled.strong`
  color: #0f172a;
  display: block;
`;

export const TypeIconLabel = styled.span`
  align-items: center;
  display: inline-flex;
  position: relative;

  &:focus-visible {
    outline: 3px solid rgb(147 197 253 / 70%);
    outline-offset: 3px;
    border-radius: 999px;
  }
`;

export const TypeTooltip = styled.span`
  background: #0f172a;
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 10px;
  bottom: calc(100% + 10px);
  box-shadow: 0 12px 30px rgb(15 23 42 / 24%);
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  left: 50%;
  letter-spacing: 0.01em;
  opacity: 0;
  padding: 6px 9px;
  pointer-events: none;
  position: absolute;
  transform: translate(-50%, 4px);
  transition: opacity 140ms ease, transform 140ms ease;
  white-space: nowrap;
  z-index: 5;

  &::after {
    border: 5px solid transparent;
    border-top-color: #0f172a;
    content: '';
    left: 50%;
    position: absolute;
    top: 100%;
    transform: translateX(-50%);
  }

  ${TypeIconLabel}:hover &,
  ${TypeIconLabel}:focus-visible & {
    opacity: 1;
    transform: translate(-50%, 0);
  }
`;

export const Badge = styled.span<{ $expired: boolean }>`
  background: ${({ $expired }) => ($expired ? '#fee2e2' : '#dcfce7')};
  border-radius: 999px;
  color: ${({ $expired }) => ($expired ? '#991b1b' : '#166534')};
  font-size: 12px;
  font-weight: 800;
  padding: 4px 8px;
`;

export const DateText = styled.span`
  color: #64748b;
  font-size: 12px;
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

export const TableIconButton = styled.button<{ $tone?: 'danger' | 'neutral'; $size?: 'compact' | 'default' }>`
  align-items: center;
  background: ${({ $tone }) => ($tone === 'danger' ? '#fee2e2' : '#eef2ff')};
  border: 0;
  border-radius: 10px;
  color: ${({ $tone }) => ($tone === 'danger' ? '#991b1b' : '#3730a3')};
  display: inline-flex;
  height: ${({ $size }) => ($size === 'compact' ? '31px' : '38px')};
  justify-content: center;
  padding: 0;
  text-decoration: none;
  width: ${({ $size }) => ($size === 'compact' ? '31px' : '38px')};

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

export const Toast = styled.div`
  background: #0f172a;
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 14px;
  bottom: 24px;
  box-shadow: 0 18px 40px rgb(15 23 42 / 28%);
  color: #ffffff;
  font-weight: 800;
  padding: 12px 14px;
  position: fixed;
  right: 24px;
  z-index: 120;
`;
