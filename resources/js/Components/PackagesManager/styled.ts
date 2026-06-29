import styled from 'styled-components';

export const PackagesManagerContainer = styled.div`
  align-items: stretch;
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
`;

export const Form = styled.form`
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
`;

export const Full = styled.div`
  grid-column: 1 / -1;
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

export const FilterControl = styled.label`
  align-items: center;
  color: #334155;
  display: flex;
  font-size: 13px;
  font-weight: 700;
  gap: 10px;
`;

export const FilterInput = styled.input`
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  color: #0f172a;
  padding: 9px 12px;
`;

export const FilterSelect = styled.select`
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  color: #0f172a;
  padding: 9px 12px;
`;

export const Input = styled.input`
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  box-sizing: border-box;
  min-width: 0;
  padding: 11px 12px;
  width: 100%;
`;

export const Select = styled.select`
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  box-sizing: border-box;
  min-width: 0;
  padding: 11px 12px;
  width: 100%;
`;

export const Textarea = styled.textarea`
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  box-sizing: border-box;
  min-height: 92px;
  min-width: 0;
  padding: 11px 12px;
  resize: vertical;
  width: 100%;
`;

export const FieldWithActions = styled.div`
  align-items: center;
  display: grid;
  gap: 8px;
  grid-template-columns: minmax(0, 1fr) auto;
  min-width: 0;
`;

export const FieldActions = styled.div`
  align-items: center;
  display: flex;
  gap: 6px;
`;

export const IconPreviewLink = styled.a`
  display: inline-flex;
  text-decoration: none;
`;

export const SwitchInput = styled.input`
  position: absolute;
  opacity: 0;
  pointer-events: none;
`;

export const SwitchTrack = styled.span`
  background: #cbd5e1;
  border-radius: 999px;
  box-shadow: inset 0 1px 2px rgb(15 23 42 / 12%);
  display: inline-flex;
  flex: 0 0 auto;
  height: 30px;
  padding: 3px;
  transition: background 160ms ease, box-shadow 160ms ease;
  width: 54px;
`;

export const SwitchThumb = styled.span`
  background: #ffffff;
  border-radius: 999px;
  box-shadow: 0 4px 10px rgb(15 23 42 / 20%);
  height: 24px;
  transition: transform 160ms ease;
  width: 24px;
`;

export const SwitchLabel = styled.label`
  align-items: center;
  display: flex;
  gap: 12px;

  ${SwitchInput}:checked + ${SwitchTrack} {
    background: #2563eb;
    box-shadow: 0 8px 18px rgb(37 99 235 / 20%);
  }

  ${SwitchInput}:checked + ${SwitchTrack} ${SwitchThumb} {
    transform: translateX(24px);
  }

  ${SwitchInput}:focus-visible + ${SwitchTrack} {
    outline: 3px solid rgb(147 197 253 / 70%);
    outline-offset: 2px;
  }
`;

export const SwitchBlock = styled.div`
  margin-bottom: 12px;
`;

export const SwitchText = styled.span`
  display: grid;
  gap: 2px;

  strong {
    color: #0f172a;
  }

  span {
    color: #64748b;
    font-size: 13px;
  }
`;

export const CheckboxLabel = SwitchLabel;

export const Button = styled.button`
  align-items: center;
  background: #2563eb;
  border: 0;
  border-radius: 12px;
  color: #ffffff;
  display: inline-flex;
  font-weight: 800;
  justify-content: center;
  min-width: 96px;
  padding: 11px 14px;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.75;
  }
`;

export const SecondaryButton = styled.button`
  align-items: center;
  background: #eef2ff;
  border: 0;
  border-radius: 12px;
  color: #3730a3;
  display: inline-flex;
  font-weight: 800;
  justify-content: center;
  padding: 11px 14px;
  text-decoration: none;
`;

export const ResetButton = styled(SecondaryButton)`
  margin-right: auto;
`;

export const ButtonSpinner = styled.span`
  animation: spin 800ms linear infinite;
  border: 2px solid rgb(255 255 255 / 45%);
  border-radius: 999px;
  border-top-color: #ffffff;
  display: inline-block;
  height: 18px;
  width: 18px;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const UploadProgress = styled.div`
  display: grid;
  gap: 8px;
  grid-column: 1 / -1;
`;

export const UploadProgressMeta = styled.div`
  align-items: center;
  color: #475569;
  display: flex;
  font-size: 13px;
  gap: 12px;
  justify-content: space-between;

  strong {
    color: #1d4ed8;
  }
`;

export const UploadProgressTrack = styled.div`
  background: #dbeafe;
  border-radius: 999px;
  height: 10px;
  overflow: hidden;
`;

export const UploadProgressBar = styled.div<{ $value: number }>`
  background: linear-gradient(90deg, #2563eb, #06b6d4);
  border-radius: inherit;
  height: 100%;
  transition: width 180ms ease;
  width: ${({ $value }) => `${$value}%`};
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
  min-width: 1040px;
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

export const PackageTitle = styled.div`
  align-items: center;
  display: flex;
  gap: 10px;
`;

export const PackageTitleText = styled.div`
  display: grid;
  gap: 2px;
`;

export const InlinePackage = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 6px;
`;

export const TargetTitle = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 10px;
`;

export const InlineTarget = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 6px;
`;

export const CodePill = styled.code`
  background: #f1f5f9;
  border-radius: 999px;
  color: #334155;
  font-size: 12px;
  padding: 4px 8px;
`;

export const CenterHeader = styled.th`
  text-align: center !important;

  ${SortButton} {
    justify-content: center;
  }
`;

export const StatusCell = styled.td`
  text-align: center !important;
`;

export const CountCell = styled.td`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-variant-numeric: tabular-nums;
  text-align: center !important;
`;

export const StatusBadge = styled.span<{ $active: boolean }>`
  align-items: center;
  background: ${({ $active }) => ($active ? '#dcfce7' : '#fee2e2')};
  border-radius: 999px;
  color: ${({ $active }) => ($active ? '#166534' : '#991b1b')};
  display: inline-flex;
  font-size: 12px;
  font-weight: 800;
  height: 24px;
  justify-content: center;
  line-height: 1;
  width: 24px;
`;

export const VersionText = styled.span`
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
`;

export const SourceBadge = styled.span<{ $source: 'uploaded' | 'remote' }>`
  align-items: center;
  background: ${({ $source }) => ($source === 'uploaded' ? '#ecfeff' : '#eef2ff')};
  border-radius: 999px;
  color: ${({ $source }) => ($source === 'uploaded' ? '#155e75' : '#3730a3')};
  display: inline-flex;
  font-size: 12px;
  font-weight: 800;
  padding: 4px 8px;
`;

export const CategoryBadge = styled.span`
  align-items: center;
  background: #f1f5f9;
  border-radius: 999px;
  color: #334155;
  display: inline-flex;
  font-size: 12px;
  font-weight: 800;
  padding: 4px 8px;
`;

export const HashText = styled.code`
  color: #64748b;
  display: block;
  font-size: 12px;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
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

export const RowActions = styled.div`
  display: flex;
  gap: 8px;
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
  max-height: min(820px, calc(100vh - 48px));
  max-width: 760px;
  overflow: auto;
  padding: 26px;
  width: min(100%, 760px);
`;

export const WideDialog = styled(Dialog)`
  max-width: 1080px;
  width: min(100%, 1080px);
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

export const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  grid-column: 1 / -1;
  justify-content: flex-end;
`;

export const ImportActions = styled(ModalActions)`
  justify-content: flex-end;
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

export const MatrixControls = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
`;

export const SegmentedControl = styled.div`
  background: #f1f5f9;
  border-radius: 14px;
  display: flex;
  gap: 4px;
  padding: 4px;
`;

export const SegmentButton = styled.button<{ $active: boolean }>`
  background: ${({ $active }) => ($active ? '#ffffff' : 'transparent')};
  border: 0;
  border-radius: 10px;
  box-shadow: ${({ $active }) => ($active ? '0 6px 16px rgb(15 23 42 / 10%)' : 'none')};
  color: ${({ $active }) => ($active ? '#1d4ed8' : '#475569')};
  font-weight: 800;
  padding: 9px 12px;
`;

export const MatrixTable = styled(Table)`
  min-width: 820px;
`;

export const AssignmentPills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const AssignmentPill = styled.span<{ $action: 'install' | 'uninstall' }>`
  background: ${({ $action }) => ($action === 'install' ? '#dcfce7' : '#fee2e2')};
  border-radius: 999px;
  color: ${({ $action }) => ($action === 'install' ? '#166534' : '#991b1b')};
  font-size: 12px;
  font-weight: 800;
  padding: 5px 9px;
`;
