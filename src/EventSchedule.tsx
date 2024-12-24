import React, { useState } from 'react';

interface EventItem {
  date: string;
  label: string;
  title: string;
  description: string;
  speaker: string;
}

const eventData: EventItem[] = [
  {
    date: 'March 31, 2024',
    label: 'Keynote',
    title: '开场致辞文案全部都是',
    description:
      '关于亚马逊云科技的 AI 产品以及本次大会的技术，我们将探讨如何利用这些技术来推动创新和发展。在这个演讲中，我们将深入探讨云计算和人工智能的最新发展，以及它们如何改变我们的工作方式。',
    speaker: '涡轮博士 — 亚马逊云科技首席技术官',
  },
  {
    date: 'March 31, 2024',
    label: 'Keynote',
    title: '云计算技术创新与应用',
    description:
      '探索云计算技术的最新创新和实际应用案例。我们将分享如何利用云服务来构建可扩展的解决方案，以及如何优化性能和成本。同时，我们还将讨论未来云计算的发展趋势。',
    speaker: '涡轮博士 — 亚马逊云科技首席技术官',
  },
  {
    date: 'March 31, 2024',
    label: 'Keynote',
    title: 'AI 技术与商业创新',
    description:
      '人工智能正在重塑商业格局。在这个演讲中，我们将探讨 AI 技术如何为企业创造价值，包括机器学习应用、自然语言处理和计算机视觉等领域的最新进展。我们还将分享一些成功的实施案例。',
    speaker: '涡轮博士 — 亚马逊云科技首席技术官',
  },
  {
    date: 'March 31, 2024',
    label: 'Keynote',
    title: '数字化转型与云战略',
    description:
      '数字化转型是企业发展的必经之路。我们将讨论如何制定有效的云战略，如何评估和选择适合的云服务，以及如何管理多云环境。同时，我们还将分享一些数字化转型的最佳实践。',
    speaker: '涡轮博士 — 亚马逊云科技首席技术官',
  },
  {
    date: 'March 31, 2024',
    label: 'Keynote',
    title: '云安全与合规性',
    description:
      '随着云计算的普及，安全性和合规性变得越来越重要。在这个演讲中，我们将探讨云环境中的安全挑战，以及如何使用最佳实践和工具来保护您的数据和应用。我们还将讨论相关的法规要求和合规框架。',
    speaker: '涡轮博士 — 亚马逊云科技首席技术官',
  },
  {
    date: 'March 31, 2024',
    label: 'Keynote',
    title: '未来技术展望',
    description:
      '展望未来，我们将探讨新兴技术趋势，包括量子计算、边缘计算、5G 等领域的发展。我们将分析这些技术可能带来的影响，以及企业如何为未来做好准备。这个演讲将帮助您了解技术发展方向，为战略决策提供参考。',
    speaker: '涡轮博士 — 亚马逊云科技首席技术官',
  },
];

const EventSchedule: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div>
      <h2
        style={{
          textAlign: 'center',
          margin: '2rem 0',
          fontSize: '1.8rem',
          fontWeight: 'bold',
        }}
      >
        会议日程
      </h2>
      <div
        style={{
          display: 'grid',
          gap: '1.5rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          padding: '0 1.5rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {eventData.map((item, index) => {
          const isExpanded = expandedIndex === index;
          return (
            <div
              key={index}
              style={{
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: '#fff',
                border: '1px solid #eee',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  '0 8px 16px rgba(0,0,0,0.1)';
                (e.currentTarget as HTMLDivElement).style.transform =
                  'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  '0 2px 4px rgba(0,0,0,0.1)';
                (e.currentTarget as HTMLDivElement).style.transform =
                  'translateY(0)';
              }}
              onClick={() => setExpandedIndex(isExpanded ? null : index)}
            >
              {/* Header */}
              <div
                style={{
                  backgroundColor: '#6B46C1',
                  color: '#fff',
                  padding: '1rem',
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                  }}
                >
                  {item.label}
                </span>
              </div>

              {/* Content */}
              <div style={{ padding: '1rem' }}>
                <p
                  style={{
                    fontWeight: '500',
                    color: '#666',
                    marginBottom: '0.5rem',
                  }}
                >
                  {item.date}
                </p>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    marginBottom: '0.75rem',
                    color: '#1a1a1a',
                  }}
                >
                  {item.title}
                </h3>
                <div
                  style={{
                    fontSize: '1rem',
                    lineHeight: '1.5',
                    color: '#4a4a4a',
                    marginBottom: '1rem',
                    transition: 'max-height 0.3s ease',
                  }}
                >
                  {isExpanded ? (
                    <p>{item.description}</p>
                  ) : (
                    <p>
                      {item.description.slice(0, 100)}...{' '}
                      <span style={{ color: '#6B46C1' }}>查看更多</span>
                    </p>
                  )}
                </div>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#666',
                    borderTop: '1px solid #eee',
                    paddingTop: '0.75rem',
                  }}
                >
                  {item.speaker}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventSchedule;
