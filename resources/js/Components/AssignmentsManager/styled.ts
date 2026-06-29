import styled from 'styled-components';

export const AssignmentsManagerContainer = styled.div`
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
  justify-content: space-between;
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

export const ToolbarActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-left: auto;
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

export const FilterControls = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  justify-content: flex-end;
  margin-left: auto;
  min-width: 0;

  @media (max-width: 640px) {
    flex-wrap: wrap;
    justify-content: flex-start;
    margin-left: 0;
    width: 100%;
  }
`;

export const FilterControl = styled.label`
  align-items: center;
  color: #334155;
  display: flex;
  font-size: 13px;
  font-weight: 700;
  gap: 6px;
  min-width: 0;
  white-space: nowrap;
`;

export const FilterInput = styled.input`
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  color: #0f172a;
  min-width: 0;
  padding: 9px 12px;
  width: 170px;
`;

export const FilterSelect = styled.select`
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  color: #0f172a;
  min-width: 0;
  padding: 9px 12px;
  width: 116px;
`;

export const FilterDropdown = styled.div`
  min-width: 240px;
  position: relative;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

export const Form = styled.form`
  display: grid;
  gap: 14px;
  grid-template-columns: 1fr;
`;

export const FormGrid = styled.div`
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const Select = styled.select`
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 11px 12px;
`;

export const ActionChoice = styled.div`
  background: #f1f5f9;
  border-radius: 14px;
  display: grid;
  gap: 4px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: 4px;
`;

export const ActionChoiceButton = styled.button<{ $active: boolean; $action: 'install' | 'uninstall' }>`
  background: ${({ $active }) => ($active ? '#ffffff' : 'transparent')};
  border: 1px solid ${({ $action }) => {
    if ($action === 'install') {
      return '#86efac';
    }

    if ($action === 'uninstall') {
      return '#fecaca';
    }

    return '#cbd5e1';
  }};
  border-radius: 10px;
  box-shadow: ${({ $active }) => ($active ? '0 6px 16px rgb(15 23 42 / 10%)' : 'none')};
  color: ${({ $active, $action }) => {
    if (!$active) {
      return '#475569';
    }

    return $action === 'install' ? '#166534' : '#991b1b';
  }};
  font-weight: 900;
  padding: 11px 12px;
`;

export const SearchDropdown = styled.div`
  position: relative;
`;

export const DropdownTrigger = styled.button`
  align-items: center;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 14px;
  display: flex;
  justify-content: space-between;
  min-height: 52px;
  padding: 9px 12px;
  text-align: left;
  width: 100%;

  &:hover {
    border-color: #93c5fd;
  }
`;

export const FilterDropdownTrigger = styled(DropdownTrigger)`
  border-radius: 12px;
  min-height: 43px;
  padding: 8px 10px;
`;

export const Placeholder = styled.span`
  color: #94a3b8;
`;

export const Caret = styled.span`
  color: #64748b;
  flex: 0 0 auto;
  font-size: 12px;
  padding-left: 12px;
`;

export const DropdownPanel = styled.div`
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 16px;
  box-shadow: 0 18px 40px rgb(15 23 42 / 16%);
  display: grid;
  gap: 8px;
  left: 0;
  margin-top: 8px;
  padding: 8px;
  position: absolute;
  right: 0;
  z-index: 20;
`;

export const DropdownSearch = styled.input`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  color: #0f172a;
  padding: 10px 12px;
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
  border-radius: 12px;
  color: #0f172a;
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  text-align: left;

  &:hover {
    background: #f1f5f9;
  }
`;

export const OptionEyebrow = styled.span`
  color: #64748b;
  display: block;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

export const OptionLabel = styled.span`
  color: #0f172a;
  display: block;
  font-weight: 800;
  margin-top: 2px;
`;

export const PackageOption = styled.span`
  align-items: center;
  display: flex;
  gap: 10px;
`;

export const SelectionSummary = styled.span`
  align-items: center;
  display: flex;
  min-width: 0;
`;

export const TargetOption = styled.span`
  align-items: center;
  display: flex;
  gap: 10px;
`;

export const PackageTitle = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 10px;
`;

export const TargetTitle = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 10px;
`;

export const InlinePackage = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 6px;
`;

export const InlineTarget = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 6px;
`;

export const EmptyOption = styled.div`
  color: #64748b;
  padding: 12px;
  text-align: center;
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
  align-items: center;
  background: #eef2ff;
  border: 0;
  border-radius: 10px;
  color: #3730a3;
  display: inline-flex;
  font-weight: 700;
  justify-content: center;
  padding: 9px 12px;
  text-decoration: none;
`;

export const MatrixButton = styled(SecondaryButton)`
  background: #f3e8ff;
  color: #6b21a8;
`;

export const ResetButton = styled(SecondaryButton)`
  margin-right: auto;
`;

export const List = styled.div`
  display: grid;
  gap: 10px;
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

export const PrimaryCell = styled.strong`
  color: #0f172a;
`;

export const CodePill = styled.code`
  background: #f1f5f9;
  border-radius: 999px;
  color: #334155;
  font-size: 12px;
  padding: 4px 8px;
`;

export const ActionBadge = styled.span<{ $action: 'install' | 'uninstall' }>`
  background: ${({ $action }) => ($action === 'install' ? '#dcfce7' : '#fee2e2')};
  border-radius: 999px;
  color: ${({ $action }) => ($action === 'install' ? '#166534' : '#991b1b')};
  font-size: 12px;
  font-weight: 800;
  padding: 4px 8px;
`;

export const EmptyCell = styled.td`
  color: #64748b;
  text-align: center !important;
`;

export const Row = styled.div`
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  display: flex;
  justify-content: space-between;
  padding: 12px;
`;

export const Meta = styled.div`
  color: #64748b;
  font-size: 13px;
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
  max-width: 900px;
  padding: 26px;
  width: min(100%, 900px);
`;

export const WideDialog = styled(Dialog)`
  max-height: min(820px, calc(100vh - 48px));
  max-width: 1080px;
  overflow: auto;
  width: min(100%, 1080px);
`;

export const FullscreenOverlay = styled(ModalOverlay)`
  align-items: stretch;
  padding: 16px;
`;

export const FullscreenDialog = styled(Dialog)`
  gap: 16px;
  grid-template-rows: auto auto minmax(0, 1fr);
  height: calc(100vh - 32px);
  max-width: none;
  overflow: hidden;
  width: 100%;
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

export const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;

  ${Button},
  ${SecondaryButton} {
    width: auto;
  }
`;

export const MatrixControls = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;

  ${FilterInput} {
    width: min(420px, 100%);
  }
`;

export const MatrixSwitchGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-left: auto;
`;

export const MatrixSwitch = styled.label`
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  color: #334155;
  display: inline-flex;
  font-size: 13px;
  font-weight: 800;
  gap: 8px;
  padding: 8px 12px;
  white-space: nowrap;

  input {
    accent-color: #7c3aed;
  }
`;

export const MatrixScroll = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
`;

export const MatrixTable = styled.table`
  border-collapse: separate;
  border-spacing: 0;
  min-width: max-content;
  width: 100%;

  th,
  td {
    border-bottom: 1px solid #e2e8f0;
    border-right: 1px solid #e2e8f0;
    padding: 0;
    vertical-align: middle;
  }

  thead th {
    background: #f8fafc;
    position: sticky;
    top: 0;
    z-index: 3;
  }
`;

export const MatrixCornerHeader = styled.th`
  color: #475569;
  font-size: 12px;
  font-weight: 900;
  left: 0;
  letter-spacing: 0.04em;
  min-width: 260px;
  padding: 14px !important;
  text-align: left;
  text-transform: uppercase;
  z-index: 5 !important;
`;

export const MatrixPackageHeader = styled.th`
  color: #0f172a;
  min-width: 180px;
  padding: 12px !important;
  text-align: left;
  width: 180px;
`;

export const MatrixPackageTitle = styled.span`
  align-items: center;
  display: flex;
  gap: 8px;
  line-height: 1.2;
`;

export const MatrixRowHeader = styled.th`
  background: #ffffff;
  left: 0;
  min-width: 260px;
  padding: 12px 14px !important;
  position: sticky;
  text-align: left;
  z-index: 2;
`;

export const MatrixRowMeta = styled.span`
  color: #64748b;
  display: block;
  font-size: 12px;
  font-weight: 700;
  margin-top: 3px;
`;

export const MatrixCell = styled.td<{ $action: '-' | 'install' | 'uninstall' | 'inherited'; $disabled: boolean; $inherited: boolean }>`
  background: ${({ $action, $inherited }) => {
    if ($inherited) {
      return '#f8fafc';
    }

    if ($action === 'install') {
      return '#f0fdf4';
    }

    if ($action === 'uninstall') {
      return '#fef2f2';
    }

    if ($action === 'inherited') {
      return '#f8fafc';
    }

    return '#ffffff';
  }};
  color: ${({ $action }) => {
    if ($action === 'install') {
      return '#166534';
    }

    if ($action === 'uninstall') {
      return '#991b1b';
    }

    return '#475569';
  }};
  box-shadow: none;
  min-width: 180px;
  opacity: ${({ $disabled }) => ($disabled ? 0.82 : 1)};
  width: 180px;
`;

export const MatrixEmptyPackageCell = styled.td`
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
  min-width: 260px;
  padding: 18px !important;
  text-align: center;
`;

export const MatrixCellStatus = styled.div`
  align-items: center;
  color: inherit;
  display: grid;
  font-weight: 900;
  gap: 3px;
  min-height: 58px;
  padding: 8px;
  place-items: center;
  width: 100%;
`;

export const MatrixCellSelect = styled.select<{ $action: '-' | 'install' | 'uninstall'; $inherited: boolean }>`
  background: ${({ $action, $inherited }) => {
    if ($inherited) {
      return '#f1f5f9';
    }

    if ($action === 'install') {
      return '#dcfce7';
    }

    if ($action === 'uninstall') {
      return '#fee2e2';
    }

    return '#e2e8f0';
  }};
  border: 1px solid ${({ $action, $inherited }) => {
    if ($inherited) {
      return '#94a3b8';
    }

    if ($action === 'install') {
      return '#86efac';
    }

    if ($action === 'uninstall') {
      return '#fecaca';
    }

    return '#cbd5e1';
  }};
  border-radius: 9px;
  color: ${({ $action }) => {
    if ($action === 'install') {
      return '#166534';
    }

    if ($action === 'uninstall') {
      return '#991b1b';
    }

    return '#334155';
  }};
  display: block;
  font-size: 12px;
  font-weight: 900;
  margin: 6px;
  min-height: 42px;
  padding: 0 10px;
  text-align: center;
  text-align-last: center;
  width: calc(100% - 12px);

  &:disabled {
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    border-color: #94a3b8;
  }
`;

export const MatrixInheritedLabel = styled.span`
  color: #475569;
  display: block;
  font-size: 10px;
  font-weight: 800;
  line-height: 1.1;
  padding: 0 6px 6px;
  text-align: center;
  width: 100%;
`;
