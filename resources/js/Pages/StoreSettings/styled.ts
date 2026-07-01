import styled from 'styled-components';

export const PageHeader = styled.div`
  display: block;
  min-height: 44px;
  padding-right: 220px;
  position: relative;

  &::after {
    clear: both;
    content: '';
    display: table;
  }

  @media (max-width: 760px) {
    min-height: 0;
    padding-right: 0;
  }
`;

export const Eyebrow = styled.div`
  color: #64748b;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.09em;
  text-transform: uppercase;
`;

export const Title = styled.h1`
  color: #0f172a;
  font-size: 30px;
  margin: 4px 0 0;
`;

export const Subtitle = styled.p`
  color: #64748b;
  margin: 6px 0 0;
`;

export const PublicLink = styled.a`
  align-items: center;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  border-radius: 12px;
  color: #3730a3;
  display: inline-flex;
  flex-shrink: 0;
  font-weight: 900;
  justify-content: center;
  margin-left: auto;
  padding: 11px 14px;
  text-decoration: none;

  @media (max-width: 760px) {
    margin-left: 0;
    width: 100%;
  }
`;

export const SettingsStack = styled.div`
  display: block;
  margin-top: 20px;

  > * + * {
    margin-top: 18px;
  }
`;

export const Panel = styled.section`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 14px 38px rgb(15 23 42 / 7%);
  display: block;
  padding: 18px;

  > * + * {
    margin-top: 16px;
  }
`;

export const PreviewPanel = styled(Panel)``;

export const PanelTitle = styled.h2`
  color: #0f172a;
  font-size: 18px;
  margin: 0;
`;

export const Form = styled.form`
  display: block;

  > * + * {
    margin-top: 16px;
  }
`;

export const Input = styled.input`
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  color: #0f172a;
  padding: 11px 12px;
  width: 100%;
`;

export const FileInput = styled(Input)`
  padding: 9px 12px;
`;

export const ColorRow = styled.div`
  display: block;

  &::after {
    clear: both;
    content: '';
    display: table;
  }

  ${Input} {
    box-sizing: border-box;
    width: calc(100% - 64px);
  }
`;

export const ColorPicker = styled.input`
  background: transparent;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  float: left;
  height: 44px;
  margin-right: 10px;
  padding: 4px;
  width: 54px;
`;

export const PresetList = styled.div`
  display: block;
  margin: 6px -5px -5px;
`;

export const ColorSwatch = styled.button<{ $color: string; $active: boolean }>`
  background: ${({ $color }) => $color};
  border: 3px solid ${({ $active }) => ($active ? '#0f172a' : '#ffffff')};
  border-radius: 999px;
  box-shadow: 0 0 0 1px #cbd5e1;
  display: inline-block;
  height: 34px;
  margin: 5px;
  width: 34px;
`;

export const SaveButton = styled.button`
  background: #111827;
  border: 0;
  border-radius: 12px;
  color: #ffffff;
  display: inline-block;
  font-weight: 900;
  padding: 12px 16px;

  &:disabled {
    cursor: wait;
    opacity: 0.65;
  }
`;

export const PreviewCard = styled.div<{ $mainColor: string }>`
  align-items: center;
  background:
    radial-gradient(circle at top left, ${({ $mainColor }) => `${$mainColor}1f`}, transparent 42%),
    #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  display: flex;
  gap: 14px;
  padding: 16px;
  width: 100%;

  @media (max-width: 760px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

export const PreviewLogo = styled.div<{ $mainColor: string }>`
  align-items: center;
  background: ${({ $mainColor }) => $mainColor};
  border-radius: 16px;
  color: #ffffff;
  display: flex;
  flex-shrink: 0;
  font-size: 22px;
  font-weight: 900;
  height: 58px;
  justify-content: center;
  overflow: hidden;
  width: 58px;
`;

export const PreviewText = styled.div`
  min-width: 0;
`;

export const PreviewLogoImage = styled.img`
  height: 100%;
  object-fit: contain;
  width: 100%;
`;

export const PreviewTitle = styled.h3`
  color: #0f172a;
  font-size: 20px;
  margin: 0;
`;

export const PreviewSubtitle = styled.p`
  color: #64748b;
  font-size: 14px;
  margin: 4px 0 0;
`;
