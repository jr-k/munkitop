import styled from 'styled-components';

export const Page = styled.main<{ $mainColor: string }>`
  background:
    radial-gradient(circle at top left, ${({ $mainColor }) => `${$mainColor}18`}, transparent 34%),
    linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
  box-sizing: border-box;
  color: #0f172a;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  padding: 28px 28px 0;

  @media (max-width: 860px) {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }
`;

export const Header = styled.header`
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  box-shadow: 0 18px 46px rgb(15 23 42 / 8%);
  display: flex;
  flex: 0 0 auto;
  gap: 18px;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 18px;
`;

export const FlashMessages = styled.div`
  margin-bottom: 18px;

  > * + * {
    margin-top: 10px;
  }
`;

export const Brand = styled.div`
  align-items: center;
  display: flex;
  gap: 14px;
  min-width: 0;

  > div {
    min-width: 0;
  }
`;

export const BrandMark = styled.div<{ $mainColor: string }>`
  align-items: center;
  background: ${({ $mainColor }) => $mainColor};
  border-radius: 16px;
  color: #ffffff;
  display: flex;
  flex: 0 0 52px;
  font-size: 22px;
  font-weight: 900;
  height: 52px;
  justify-content: center;
  overflow: hidden;
  text-align: center;
  width: 52px;
`;

export const BrandLogo = styled.img`
  height: 100%;
  object-fit: contain;
  width: 100%;
`;

export const Title = styled.h1`
  font-size: 28px;
  margin: 0;
`;

export const Subtitle = styled.p`
  color: #64748b;
  margin: 4px 0 0;
`;

export const HeaderActions = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 auto;
  gap: 10px;

  @media (max-width: 720px) {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
`;

export const LanguageSelectWrapper = styled.div`
  position: relative;

  &::after {
    color: #64748b;
    content: '▾';
    font-size: 12px;
    pointer-events: none;
    position: absolute;
    right: 11px;
    top: 50%;
    transform: translateY(-50%);
  }
`;

export const LanguageSelect = styled.select`
  appearance: none;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  color: #0f172a;
  cursor: pointer;
  font-size: 13px;
  font-weight: 900;
  min-height: 38px;
  padding: 0 30px 0 12px;

  &:hover {
    background: #eef2f7;
  }

  &:focus {
    border-color: #94a3b8;
    outline: 3px solid rgb(148 163 184 / 24%);
  }
`;

export const AdminLink = styled.a`
  background: #eef2ff;
  border-radius: 12px;
  color: #3730a3;
  font-weight: 800;
  padding: 11px 14px;
  text-decoration: none;
`;

export const LogoutButton = styled.button`
  background: #fee2e2;
  border: 0;
  border-radius: 12px;
  color: #991b1b;
  font-weight: 800;
  padding: 11px 14px;
`;

export const ContentLayout = styled.div`
  display: flex;
  flex: 1 1 auto;
  gap: 18px;
  min-height: 0;

  @media (max-width: 860px) {
    flex: 0 0 auto;
    flex-direction: column;
    min-height: auto;
  }
`;

export const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  flex: 0 0 260px;
  gap: 18px;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding-bottom: 28px;
  width: 260px;

  @media (max-width: 860px) {
    flex-basis: auto;
    height: auto;
    overflow: visible;
    width: auto;
  }
`;

export const SidebarSection = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  box-sizing: border-box;
  flex: 0 0 auto;
  padding: 14px;
`;

export const SidebarTitle = styled.h2`
  color: #475569;
  font-size: 13px;
  letter-spacing: 0.08em;
  margin: 0;
  text-transform: uppercase;
`;

export const CategoryList = styled.div`
  margin-top: 10px;
  padding-right: 2px;
`;

export const CategoryButton = styled.button<{ $active: boolean; $mainColor: string }>`
  background: ${({ $active }) => ($active ? '#eff6ff' : 'transparent')};
  border: 1px solid ${({ $active, $mainColor }) => ($active ? $mainColor : 'transparent')};
  border-radius: 12px;
  color: ${({ $active, $mainColor }) => ($active ? $mainColor : '#334155')};
  cursor: pointer;
  align-items: center;
  display: flex;
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? 800 : 700)};
  gap: 12px;
  justify-content: space-between;
  margin-top: 6px;
  padding: 9px 10px;
  text-align: left;
  width: 100%;

  &:hover {
    background: #f8fafc;
    border-color: #e2e8f0;
  }
`;

export const CategoryCount = styled.span`
  background: #e2e8f0;
  border-radius: 999px;
  color: #475569;
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 800;
  min-width: 28px;
  padding: 3px 7px;
  text-align: center;
`;

export const MainContent = styled.div`
  box-sizing: border-box;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  overflow-y: auto;
  padding: 0 16px 28px;

  @media (max-width: 860px) {
    height: auto;
    overflow: visible;
    padding: 0 0 28px;
  }
`;

export const Filters = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 12px 34px rgb(15 23 42 / 6%);
  display: block;
  padding: 6px;
`;

export const SearchInput = styled.input`
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  box-sizing: border-box;
  font-size: 14px;
  height: 34px;
  padding: 0 10px;
  width: 100%;
`;

export const Section = styled.section`
  display: block;
  margin-top: 18px;
`;

export const SectionHeader = styled.div`
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 8px;
  min-height: 30px;
`;

export const SectionTitle = styled.h2`
  font-size: 20px;
  margin: 0;
`;

export const ResultCount = styled.span`
  background: #e2e8f0;
  border-radius: 999px;
  color: #475569;
  font-size: 12px;
  font-weight: 900;
  min-width: 32px;
  padding: 5px 9px;
  text-align: center;
`;

export const CardList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`;

export const Card = styled.article<{ $mainColor: string }>`
  background:
    linear-gradient(180deg, rgb(255 255 255 / 94%), #ffffff),
    #ffffff;
  border: 1px solid rgb(226 232 240 / 90%);
  border-radius: 22px;
  box-sizing: border-box;
  box-shadow: 0 16px 44px rgb(15 23 42 / 8%);
  align-items: flex-start;
  display: flex;
  gap: 8px;
  padding: 16px 8px;
  position: relative;
  text-decoration: none;
  transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
  width: calc(25% - 12px);

  @media (max-width: 1500px) {
    width: calc(33.333% - 11px);
  }

  @media (max-width: 1180px) {
    width: calc(50% - 8px);
  }

  @media (max-width: 920px) {
    width: 100%;
  }

  &:hover {
    border-color: ${({ $mainColor }) => $mainColor};
    box-shadow: 0 22px 54px ${({ $mainColor }) => `${$mainColor}21`};
    transform: translateY(-1px);
  }
`;

export const CardStatus = styled.span<{ $status: 'forced_install' | 'forced_uninstall' | 'installed' | 'available' }>`
  align-items: center;
  background: ${({ $status }) => {
    if ($status === 'forced_install') {
      return '#ecfdf5';
    }

    if ($status === 'forced_uninstall') {
      return '#fee2e2';
    }

    if ($status === 'installed') {
      return '#ecfdf5';
    }

    return '#f0f9ff';
  }};
  border-radius: 999px;
  bottom: 10px;
  color: ${({ $status }) => {
    if ($status === 'forced_install') {
      return '#15803d';
    }

    if ($status === 'forced_uninstall') {
      return '#991b1b';
    }

    if ($status === 'installed') {
      return '#15803d';
    }

    return '#0284c7';
  }};
  display: flex;
  font-size: 13px;
  font-weight: 900;
  height: 22px;
  justify-content: center;
  line-height: 1;
  position: absolute;
  right: 10px;
  width: 22px;
`;

export const IconWrap = styled.div`
  align-items: flex-start;
  display: flex;
  flex: 0 0 76px;
  height: 76px;
  justify-content: center;
  width: 76px;
`;

export const CardBody = styled.div`
  flex: 1 1 auto;
  min-width: 0;
`;

export const CardHeader = styled.div`
  display: block;
  min-height: 30px;

  > div {
    min-width: 0;
  }
`;

export const CardTitle = styled.h3`
  -webkit-box-orient: vertical;
  color: #0f172a;
  display: -webkit-box;
  font-size: 16px;
  -webkit-line-clamp: 2;
  line-height: 1.2;
  margin: 0 0 4px 0;
  overflow: hidden;
`;

export const Meta = styled.div`
  color: #64748b;
  font-size: 13px;
`;

export const Badges = styled.div`
  display: block;
  margin: -4px;
`;

export const Badge = styled.span`
  background: #eff6ff;
  border-radius: 999px;
  color: #1d4ed8;
  display: inline-block;
  font-size: 12px;
  font-weight: 800;
  margin: 4px;
  padding: 5px 9px;
`;

export const AvailabilityBadge = styled(Badge)<{ $availability: 'install' | 'uninstall' | 'on_demand' | 'optional_install' | null }>`
  background: ${({ $availability }) => {
    if ($availability === 'install' || $availability === 'optional_install') {
      return '#dcfce7';
    }

    if ($availability === 'uninstall') {
      return '#fee2e2';
    }

    return '#eff6ff';
  }};
  color: ${({ $availability }) => {
    if ($availability === 'install' || $availability === 'optional_install') {
      return '#166534';
    }

    if ($availability === 'uninstall') {
      return '#991b1b';
    }

    return '#1d4ed8';
  }};
`;

export const LockedBadge = styled(Badge)`
  background: #f1f5f9;
  color: #475569;
`;

export const StoreSwitchInput = styled.input`
  height: 1px;
  opacity: 0;
  position: absolute;
  width: 1px;
`;

export const StoreSwitchThumb = styled.span`
  background: #ffffff;
  border-radius: 999px;
  box-shadow: 0 2px 8px rgb(15 23 42 / 24%);
  height: 22px;
  left: 3px;
  position: absolute;
  top: 3px;
  transition: transform 160ms ease;
  width: 22px;
`;

export const StoreSwitchTrack = styled.span`
  background: #cbd5e1;
  border-radius: 999px;
  display: block;
  height: 28px;
  position: relative;
  transition: background 160ms ease;
  width: 52px;
`;

export const StoreSwitchLabel = styled.label<{ $disabled: boolean; $mainColor: string }>`
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.58 : 1)};

  ${StoreSwitchInput}:checked + ${StoreSwitchTrack} {
    background: ${({ $mainColor }) => $mainColor};
  }

  ${StoreSwitchInput}:checked + ${StoreSwitchTrack} ${StoreSwitchThumb} {
    transform: translateX(24px);
  }

  ${StoreSwitchInput}:focus-visible + ${StoreSwitchTrack} {
    outline: 3px solid ${({ $mainColor }) => `${$mainColor}47`};
    outline-offset: 3px;
  }
`;

export const ManifestNotice = styled.div`
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 16px;
  color: #9a3412;
  font-size: 14px;
  font-weight: 800;
  margin-bottom: 18px;
  padding: 14px 16px;
`;

export const Empty = styled.div`
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  color: #64748b;
  font-size: 14px;
  padding: 12px 14px;
  text-align: center;
`;
