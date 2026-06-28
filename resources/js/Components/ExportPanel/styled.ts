import styled from 'styled-components';

export const ExportPanelContainer = styled.div`
  display: grid;
  gap: 18px;
`;

export const Hero = styled.div`
  align-items: center;
  background: #0f172a;
  border-radius: 20px;
  color: #ffffff;
  display: flex;
  justify-content: space-between;
  padding: 22px;

  @media (max-width: 760px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 16px;
  }
`;

export const Content = styled.div`
  display: grid;
  gap: 6px;
`;

export const Title = styled.h2`
  font-size: 18px;
  margin: 0;
`;

export const Meta = styled.p`
  color: #cbd5e1;
  margin: 0;
`;

export const HeroActions = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

export const Button = styled.button`
  background: #22c55e;
  border: 0;
  border-radius: 12px;
  color: #052e16;
  font-weight: 900;
  padding: 12px 16px;
`;

export const RepoLink = styled.a`
  background: rgb(255 255 255 / 12%);
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 12px;
  color: #ffffff;
  font-weight: 900;
  padding: 12px 16px;
  text-decoration: none;

  &:hover {
    background: rgb(255 255 255 / 18%);
  }
`;

export const SecondaryButton = styled.button`
  background: #e2e8f0;
  border: 0;
  border-radius: 12px;
  color: #0f172a;
  font-weight: 800;
  padding: 12px 16px;
`;

export const Instructions = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 16px 40px rgb(15 23 42 / 6%);
  display: grid;
  gap: 18px;
  padding: 22px;
`;

export const SwitchInput = styled.input`
  height: 1px;
  opacity: 0;
  position: absolute;
  width: 1px;
`;

export const SwitchThumb = styled.span`
  background: #ffffff;
  border-radius: 999px;
  box-shadow: 0 1px 4px rgb(15 23 42 / 20%);
  height: 20px;
  left: 3px;
  position: absolute;
  top: 3px;
  transition: transform 160ms ease;
  width: 20px;
`;

export const SwitchTrack = styled.span`
  background: #cbd5e1;
  border-radius: 999px;
  flex: 0 0 auto;
  height: 26px;
  position: relative;
  transition: background 160ms ease;
  width: 48px;
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

export const SwitchLabel = styled.label`
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: 12px;

  ${SwitchInput}:checked + ${SwitchTrack} {
    background: #2563eb;
  }

  ${SwitchInput}:checked + ${SwitchTrack} ${SwitchThumb} {
    transform: translateX(22px);
  }
`;

export const UrlField = styled.label`
  display: grid;
  gap: 8px;
`;

export const UrlLabel = styled.span`
  color: #0f172a;
  font-weight: 800;
`;

export const UrlInput = styled.input`
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  color: #0f172a;
  padding: 12px 14px;

  &:disabled {
    background: #f1f5f9;
    color: #64748b;
  }
`;

export const UrlHint = styled.span`
  color: #64748b;
  font-size: 13px;
`;

export const ErrorText = styled.span`
  color: #dc2626;
  font-size: 13px;
  font-weight: 700;
`;

export const SettingsActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
`;

export const SectionTitle = styled.h3`
  color: #0f172a;
  font-size: 18px;
  margin: 0;
`;

export const Text = styled.p`
  color: #475569;
  line-height: 1.6;
  margin: 0;
`;

export const CodeBlock = styled.pre`
  background: #0f172a;
  border-radius: 16px;
  color: #dbeafe;
  margin: 0;
  overflow: auto;
  padding: 16px;
  white-space: pre-wrap;

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
  }
`;

export const Steps = styled.div`
  display: grid;
  gap: 10px;
`;

export const Step = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  display: grid;
  gap: 4px;
  padding: 14px;

  strong {
    color: #0f172a;
  }

  span {
    color: #475569;
  }

  code {
    background: #e2e8f0;
    border-radius: 7px;
    color: #0f172a;
    padding: 2px 6px;
  }
`;

export const EmptyState = styled.div`
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  color: #64748b;
  padding: 16px;
`;

export const ProfileGrid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
`;

export const ProfileCard = styled.div`
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  display: flex;
  gap: 14px;
  justify-content: space-between;
  padding: 16px;

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

export const ProfileTitle = styled.strong`
  color: #0f172a;
  display: block;
`;

export const ProfileMeta = styled.span`
  color: #64748b;
  display: block;
  font-size: 13px;
  margin-top: 4px;

  code {
    background: #e2e8f0;
    border-radius: 7px;
    color: #0f172a;
    padding: 2px 6px;
  }
`;

export const DownloadLink = styled.a`
  background: #2563eb;
  border-radius: 12px;
  color: #ffffff;
  flex: 0 0 auto;
  font-size: 13px;
  font-weight: 800;
  padding: 10px 12px;
  text-decoration: none;

  &:hover {
    background: #1d4ed8;
  }
`;

export const FileSections = styled.div`
  display: grid;
  gap: 16px;
`;

export const FileSection = styled.div`
  display: grid;
  gap: 10px;
`;

export const FileSectionTitle = styled.h4`
  color: #0f172a;
  font-size: 15px;
  margin: 0;
  text-transform: uppercase;
`;

export const FileList = styled.div`
  display: grid;
  gap: 12px;
`;

export const FileCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  display: grid;
  gap: 12px;
  padding: 14px;
`;

export const FileHeader = styled.div`
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

export const FileName = styled.strong`
  color: #0f172a;
  display: block;
`;

export const FileMeta = styled.span`
  color: #64748b;
  display: block;
  font-size: 13px;
  margin-top: 3px;
`;

export const FileLink = styled.a`
  background: #e0f2fe;
  border-radius: 999px;
  color: #0369a1;
  flex: 0 0 auto;
  font-size: 13px;
  font-weight: 800;
  padding: 8px 12px;
  text-decoration: none;

  &:hover {
    background: #bae6fd;
  }
`;

export const FilePreview = styled.pre`
  background: #0f172a;
  border-radius: 12px;
  color: #dbeafe;
  margin: 0;
  max-height: 360px;
  overflow: auto;
  padding: 14px;
  white-space: pre-wrap;

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
  }
`;
