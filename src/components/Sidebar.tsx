import React, { useMemo, useState } from 'react';
import {
  AlignLeft,
  ChevronDown,
  ChevronUp,
  Database,
  FileText,
  Gauge,
  GitBranch,
  LineChart,
  ListFilter,
  Mail,
  MessageSquare,
  MessagesSquare,
  Phone,
  Target,
  Type,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import {
  MenuIconKey,
  MenuItem,
  SIDEBAR_MENU,
  stripVietnameseAccents,
} from '../data/menuConfig';

interface SidebarProps {
  activeMenuId: string;
  onSelectMenu: (item: MenuItem) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

function renderMenuIcon(icon: MenuIconKey, isActive: boolean, isChild = false) {
  const size = isChild ? 16 : 18;
  const colorClass = isActive ? 'text-[#3B49DF]' : 'text-[#64748B]';
  const strokeWidth = 1.75;

  switch (icon) {
    case 'monitor':
      return <Gauge size={size} strokeWidth={strokeWidth} className={colorClass} />;
    case 'chart-box':
      return <LineChart size={size} strokeWidth={strokeWidth} className={colorClass} />;
    case 'receive':
      return <MessagesSquare size={size} strokeWidth={strokeWidth} className={colorClass} />;
    case 'mail':
      return <Mail size={size} strokeWidth={strokeWidth} className={colorClass} />;
    case 'chat':
      return <MessageSquare size={size} strokeWidth={strokeWidth} className={colorClass} />;
    case 'page':
      return <FileText size={size} strokeWidth={strokeWidth} className={colorClass} />;
    case 'workflow':
      return <GitBranch size={size} strokeWidth={strokeWidth} className={colorClass} />;
    case 'users':
      return <Users size={size} strokeWidth={strokeWidth} className={colorClass} />;
    case 'database':
      return <Database size={size} strokeWidth={strokeWidth} className={colorClass} />;
    case 'type':
      return <Type size={size} strokeWidth={strokeWidth} className={colorClass} />;
    case 'target':
      return <Target size={size} strokeWidth={strokeWidth} className={colorClass} />;
    case 'user-check':
      return <UserCheck size={size} strokeWidth={strokeWidth} className={colorClass} />;
    case 'phone':
      return <Phone size={size} strokeWidth={strokeWidth} className={colorClass} />;
    default:
      return <FileText size={size} strokeWidth={strokeWidth} className={colorClass} />;
  }
}

function hasActiveDescendant(item: MenuItem, activeId: string): boolean {
  if (item.id === activeId) return true;
  if (!item.children) return false;
  return item.children.some((child) => hasActiveDescendant(child, activeId));
}

function filterMenuItems(items: MenuItem[], query: string): MenuItem[] {
  if (!query.trim()) return items;
  const normalizedQuery = stripVietnameseAccents(query.trim());

  const result: MenuItem[] = [];
  for (const item of items) {
    const labelMatch = stripVietnameseAccents(item.label).includes(normalizedQuery);
    const filteredChildren = item.children
      ? filterMenuItems(item.children, query)
      : undefined;

    if (labelMatch || (filteredChildren && filteredChildren.length > 0)) {
      result.push({
        ...item,
        children: labelMatch ? item.children : filteredChildren,
      });
    }
  }
  return result;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeMenuId,
  onSelectMenu,
  collapsed,
  onToggleCollapse,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOnlyDashboard, setFilterOnlyDashboard] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    'inbound-receive': true,
    'common-dashboard': true,
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredSections = useMemo(() => {
    return SIDEBAR_MENU.map((section) => {
      let items = filterMenuItems(section.items, searchQuery);
      if (filterOnlyDashboard) {
        const onlyDash = (list: MenuItem[]): MenuItem[] => {
          const out: MenuItem[] = [];
          for (const it of list) {
            const kids = it.children ? onlyDash(it.children) : [];
            if (
              it.dashboardTab ||
              it.id === 'common-general-dashboard' ||
              it.id === 'common-qa-dashboard' ||
              it.id === 'common-wfm-dashboard' ||
              kids.length > 0
            ) {
              out.push({ ...it, children: kids.length > 0 ? kids : undefined });
            }
          }
          return out;
        };
        items = onlyDash(items);
      }
      return { ...section, items };
    }).filter((sec) => sec.items.length > 0);
  }, [searchQuery, filterOnlyDashboard]);

  const isSearching = searchQuery.trim().length > 0 || filterOnlyDashboard;

  return (
    <aside
      className={`flex flex-col bg-white border-r border-[#E6EAF2] shrink-0 select-none transition-[width] duration-200 ease-out h-screen ${
        collapsed ? 'w-[68px]' : 'w-[258px]'
      }`}
    >
      {/* Brand Header */}
      <div className="h-[58px] px-4 flex items-center justify-between border-b border-transparent shrink-0">
        {!collapsed && (
          <button
            type="button"
            onClick={() => {
              const omni = SIDEBAR_MENU[0].items.find(
                (i) => i.id === 'inbound-omni-dashboard'
              );
              if (omni) onSelectMenu(omni);
            }}
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-md"
            title="Về Omni Dashboard"
          >
            {/* UniSpace-CX Cloud + Chart Logo Mark */}
            <svg
              width="34"
              height="26"
              viewBox="0 0 38 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M10.5 23.5H28.5C32.366 23.5 35.5 20.366 35.5 16.5C35.5 12.91 32.796 9.95 29.31 9.546C28.278 5.27 24.432 2.1 19.85 2.1C14.79 2.1 10.63 5.96 10.15 10.9C6.42 11.12 3.5 14.21 3.5 17.95C3.5 21.01 6.63 23.5 10.5 23.5Z"
                stroke="#F58220"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="#FFF8F1"
              />
              <rect x="11.5" y="15.5" width="3" height="5" rx="0.8" fill="#1D8FE1" />
              <rect x="16.5" y="12.5" width="3" height="8" rx="0.8" fill="#1D8FE1" />
              <rect x="21.5" y="9.5" width="3" height="11" rx="0.8" fill="#1D8FE1" />
              <path
                d="M10.5 14.5C15 13.5 21 10.2 26.5 6.8"
                stroke="#1D8FE1"
                strokeWidth="2.1"
                strokeLinecap="round"
              />
              <path
                d="M23.2 6.2L27.1 6.5L26 10.2"
                stroke="#1D8FE1"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[15px] font-bold tracking-tight text-[#F58220] whitespace-nowrap">
              UniSpace-CX
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={onToggleCollapse}
          className={`p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
            collapsed ? 'mx-auto' : ''
          }`}
          title={collapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
          aria-label={collapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
        >
          <AlignLeft size={17} strokeWidth={1.8} />
        </button>
      </div>

      {/* Menu Search Row */}
      {!collapsed && (
        <div className="px-3.5 pt-2 pb-3 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setFilterOnlyDashboard((prev) => !prev)}
            className={`p-1.5 rounded-md transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
              filterOnlyDashboard
                ? 'bg-[#EEF2FF] text-[#3B49DF]'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
            title={
              filterOnlyDashboard
                ? 'Đang lọc: Chỉ hiện mục Dashboard Realtime'
                : 'Lọc nhanh các mục Dashboard Realtime'
            }
          >
            <ListFilter size={15} strokeWidth={2} />
          </button>

          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm menu"
              className="w-full h-[34px] px-3 pr-7 text-[13px] bg-[#F5F7FA] border border-[#D8DFE9] rounded-[6px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#3B49DF] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                aria-label="Xóa từ khóa tìm kiếm"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation Tree */}
      <nav
        className="flex-1 overflow-y-auto sidebar-scroll pb-6"
        aria-label="Menu điều hướng chính"
      >
        {filteredSections.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-slate-500">Không tìm thấy mục menu phù hợp.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterOnlyDashboard(false);
              }}
              className="mt-2 text-xs font-medium text-[#3B49DF] hover:underline"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          filteredSections.map((section, secIdx) => (
            <div key={section.id} className={secIdx > 0 ? 'mt-3' : ''}>
              {!collapsed && (
                <div className="px-3.5 py-1.5 text-[12.5px] font-medium text-[#334155]">
                  {section.title}
                </div>
              )}

              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const hasChildren = Boolean(item.children && item.children.length > 0);
                  const isBranchActive = hasActiveDescendant(item, activeMenuId);
                  const isItemDirectActive = item.id === activeMenuId;
                  const isExpanded = isSearching ? true : Boolean(expandedIds[item.id]);

                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          if (hasChildren) {
                            if (collapsed) {
                              onToggleCollapse();
                              setExpandedIds((prev) => ({ ...prev, [item.id]: true }));
                            } else {
                              toggleExpand(item.id);
                            }
                          } else {
                            onSelectMenu(item);
                          }
                        }}
                        title={collapsed ? item.label : undefined}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3B49DF] ${
                          isBranchActive || isItemDirectActive
                            ? 'bg-[#F4F5FC] text-[#3B49DF] font-medium'
                            : 'text-[#334155] hover:bg-[#F8FAFC] hover:text-slate-900 font-normal'
                        }`}
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <span className="shrink-0">
                            {renderMenuIcon(item.icon, isBranchActive || isItemDirectActive)}
                          </span>
                          {!collapsed && (
                            <span className="truncate text-left">{item.label}</span>
                          )}
                        </span>

                        {!collapsed && hasChildren && (
                          <span
                            className={`shrink-0 ml-2 ${
                              isBranchActive ? 'text-[#3B49DF]' : 'text-slate-400'
                            }`}
                          >
                            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </span>
                        )}
                      </button>

                      {/* Level 2 Submenu */}
                      {!collapsed && hasChildren && isExpanded && item.children && (
                        <ul className="mt-0.5 space-y-0.5">
                          {item.children.map((child) => {
                            const childHasKids = Boolean(
                              child.children && child.children.length > 0
                            );
                            const isChildActive = hasActiveDescendant(child, activeMenuId);
                            const isChildExpanded = isSearching
                              ? true
                              : Boolean(expandedIds[child.id]);

                            return (
                              <li key={child.id}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (childHasKids) {
                                      toggleExpand(child.id);
                                      if (child.dashboardTab) {
                                        onSelectMenu(child);
                                      }
                                    } else {
                                      onSelectMenu(child);
                                    }
                                  }}
                                  className={`w-full flex items-center justify-between pl-9 pr-4 py-2 text-[12.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3B49DF] ${
                                    isChildActive
                                      ? 'bg-[#F4F5FC] text-[#3B49DF] font-medium'
                                      : 'text-[#334155] hover:bg-[#F8FAFC] hover:text-slate-900'
                                  }`}
                                >
                                  <span className="flex items-center gap-2.5 min-w-0">
                                    <span className="shrink-0">
                                      {renderMenuIcon(child.icon, isChildActive, true)}
                                    </span>
                                    <span className="truncate text-left">{child.label}</span>
                                  </span>

                                  {childHasKids && (
                                    <span className="shrink-0 ml-2 text-slate-400">
                                      {isChildExpanded ? (
                                        <ChevronUp size={14} />
                                      ) : (
                                        <ChevronDown size={14} />
                                      )}
                                    </span>
                                  )}
                                </button>

                                {/* Level 3 Submenu */}
                                {childHasKids && isChildExpanded && child.children && (
                                  <ul className="mt-0.5 space-y-0.5">
                                    {child.children.map((grand) => {
                                      const isGrandActive = grand.id === activeMenuId;
                                      return (
                                        <li key={grand.id}>
                                          <button
                                            type="button"
                                            onClick={() => onSelectMenu(grand)}
                                            className={`w-full flex items-center gap-2.5 pl-14 pr-4 py-1.5 text-[12px] transition-colors ${
                                              isGrandActive
                                                ? 'bg-[#F4F5FC] text-[#3B49DF] font-medium'
                                                : 'text-slate-600 hover:bg-[#F8FAFC] hover:text-slate-900'
                                            }`}
                                          >
                                            <span className="truncate text-left">
                                              {grand.label}
                                            </span>
                                          </button>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </nav>
    </aside>
  );
};
