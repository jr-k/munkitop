import styled from 'styled-components';

export const Overlay = styled.div`
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
  border: 1px solid rgb(255 255 255 / 72%);
  border-radius: 24px;
  box-shadow: 0 24px 80px rgb(15 23 42 / 28%);
  display: grid;
  gap: 20px;
  max-height: min(820px, calc(100vh - 48px));
  max-width: 780px;
  overflow: auto;
  padding: 26px;
  width: min(100%, 780px);
`;

export const Header = styled.div`
  align-items: flex-start;
  display: flex;
  gap: 18px;
  justify-content: space-between;
`;

export const Title = styled.h2`
  color: #0f172a;
  font-size: 22px;
  margin: 0;
`;

export const Description = styled.p`
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

export const Preview = styled.pre`
  background: #0f172a;
  border-radius: 14px;
  color: #dbeafe;
  margin: 0;
  max-height: 380px;
  overflow: auto;
  padding: 16px;
  white-space: pre-wrap;

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
  }
`;

export const EmptyState = styled.div`
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  color: #64748b;
  padding: 16px;
`;

export const ShareBox = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  display: grid;
  gap: 12px;
  padding: 14px;
`;

export const ShareControls = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

export const ShareLabel = styled.label`
  align-items: center;
  color: #334155;
  display: inline-flex;
  font-size: 13px;
  font-weight: 800;
  gap: 8px;
`;

export const Select = styled.select`
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  color: #0f172a;
  padding: 9px 10px;
`;

export const ShareLink = styled.input`
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  color: #0f172a;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  padding: 10px 12px;
  width: 100%;
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
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

export const SecondaryButton = styled.a`
  background: #eef2ff;
  border: 0;
  border-radius: 10px;
  color: #3730a3;
  display: inline-flex;
  font-weight: 700;
  padding: 9px 12px;
  text-decoration: none;
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
