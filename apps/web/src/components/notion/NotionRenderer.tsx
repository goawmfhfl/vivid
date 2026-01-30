"use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import type { NotionBlock } from "@/lib/types/notion";
import type { NotionBlockContent, NotionRichText } from "@/lib/types/notion-api";

type NotionRendererProps = {
  blocks: NotionBlock[];
  onImageError?: (blockId: string) => void;
};

/**
 * 노션 블록을 렌더링하는 컴포넌트
 */
export function NotionRenderer({ blocks, onImageError }: NotionRendererProps) {
  if (!blocks || blocks.length === 0) {
    return (
      <p
        className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
        style={{ color: COLORS.text.secondary }}
      >
        내용이 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <NotionBlocks blocks={blocks} onImageError={onImageError} />
    </div>
  );
}

function NotionBlocks({
  blocks,
  onImageError,
}: {
  blocks: NotionBlock[];
  onImageError?: (blockId: string) => void;
}) {
  if (!blocks || blocks.length === 0) return null;

  const elements: React.ReactNode[] = [];
  let index = 0;

  while (index < blocks.length) {
    const block = blocks[index];
    const isListItem =
      block.type === "bulleted_list_item" || block.type === "numbered_list_item";

    if (isListItem) {
      const listType = block.type;
      const listItems: NotionBlock[] = [];

      while (index < blocks.length && blocks[index].type === listType) {
        listItems.push(blocks[index]);
        index += 1;
      }

      const ListTag = listType === "bulleted_list_item" ? "ul" : "ol";
      const listClassName =
        listType === "bulleted_list_item"
          ? "my-2 space-y-1 pl-5 list-disc list-outside"
          : "my-2 space-y-1 pl-5 list-decimal list-outside";
      elements.push(
        <ListTag
          key={`${listType}-${listItems[0]?.id}`}
          className={listClassName}
          style={{ listStylePosition: "outside" }}
        >
          {listItems.map((item) => (
            <NotionBlock
              key={item.id}
              block={item}
              onImageError={onImageError}
              asListItem
            />
          ))}
        </ListTag>
      );
      continue;
    }

    elements.push(
      <NotionBlock
        key={block.id}
        block={block}
        onImageError={onImageError}
      />
    );
    index += 1;
  }

  return <>{elements}</>;
}

/**
 * 개별 노션 블록 렌더링
 */
function NotionBlock({
  block,
  onImageError,
  asListItem = false,
}: {
  block: NotionBlock;
  onImageError?: (blockId: string) => void;
  asListItem?: boolean;
}) {
  const blockType = block.type;
  const blockContent = block[blockType] as NotionBlockContent | undefined;

  // Rich text 추출 헬퍼
  const getRichText = (richText: NotionRichText[] | undefined): string => {
    if (!richText || !Array.isArray(richText)) return "";
    return richText.map((text: NotionRichText) => text.plain_text || "").join("");
  };

  // 노션 색상 매핑 (배경색 포함)
  const getColorStyle = (color: string | undefined) => {
    if (!color || color === "default") return {};
    
    // 배경색 (background_ 접두사)
    if (color.startsWith("background_")) {
      const bgColor = color.replace("background_", "");
      const colorMap: Record<string, string> = {
        gray: "#E9E9E9",
        brown: "#E9E5E3",
        orange: "#FADEC9",
        yellow: "#FBF3DB",
        green: "#DBEDDB",
        blue: "#DBE3F5",
        purple: "#E9DEEE",
        pink: "#F4DDDD",
        red: "#FBE4E4",
      };
      return {
        backgroundColor: colorMap[bgColor] || colorMap.gray,
      };
    }
    
    // 텍스트 색상
    const textColorMap: Record<string, string> = {
      gray: COLORS.text.secondary,
      brown: "#8B4513",
      orange: "#FF8C00",
      yellow: "#FFD700",
      green: "#228B22",
      blue: COLORS.brand.primary,
      purple: "#9370DB",
      pink: "#FF69B4",
      red: "#DC143C",
    };
    
    return {
      color: textColorMap[color] || COLORS.text.primary,
    };
  };

  // Rich text를 JSX로 변환 (링크, 굵게, 기울임, 배경색 등 지원)
  const renderRichText = (richText: NotionRichText[] | undefined) => {
    if (!richText || !Array.isArray(richText)) return null;
    
    return richText.map((text: NotionRichText, index: number) => {
      const textContent = text.plain_text || "";
      const displayText = textContent.replace(/ {2,}/g, (match) => {
        return ` ${"\u00A0".repeat(match.length - 1)}`;
      });
      const annotations = text.annotations || {};
      const color = annotations.color;
      
      // 기본 스타일 (색상 포함)
      const colorStyle = getColorStyle(color);
      
      // 배경색이 있는 경우 padding 추가
      const hasBackground = color && color.startsWith("background_");
      const backgroundStyle = hasBackground
        ? {
            ...colorStyle,
            padding: "0.125rem 0.25rem",
            borderRadius: "0.25rem",
            display: "inline",
          }
        : colorStyle;
      
      let element = (
        <span key={index} style={{ ...backgroundStyle, whiteSpace: "pre-wrap" }}>
          {displayText}
        </span>
      );
      
      if (annotations.bold) {
        element = <strong key={index}>{element}</strong>;
      }
      if (annotations.italic) {
        element = <em key={index}>{element}</em>;
      }
      if (annotations.strikethrough) {
        element = <del key={index}>{element}</del>;
      }
      if (annotations.underline) {
        element = <u key={index}>{element}</u>;
      }
      if (annotations.code) {
        element = (
          <code
            key={index}
            className="px-1.5 py-0.5 rounded text-sm"
            style={{
              backgroundColor: COLORS.background.hover,
              color: COLORS.text.primary,
              ...colorStyle,
            }}
          >
            {displayText}
          </code>
        );
      }
      if (text.href) {
        element = (
          <a
            key={index}
            href={text.href}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: COLORS.brand.primary, ...backgroundStyle }}
          >
            {element}
          </a>
        );
      }
      
      return element;
    });
  };

  const getImageUrlFromBlock = (targetBlock: NotionBlock) => {
    const imageData = (targetBlock as { image?: Record<string, unknown> }).image;
    const imageType = imageData?.type as "external" | "file" | undefined;
    const imageUrl =
      imageType === "external"
        ? (imageData?.external as { url?: string } | undefined)?.url
        : (imageData?.file as { url?: string } | undefined)?.url;
    return imageUrl || null;
  };

  switch (blockType) {
    case "paragraph":
      const paragraphText = getRichText(blockContent?.rich_text);
      if (!paragraphText) return null;
      return (
        <p
          className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
          style={{ color: COLORS.text.primary }}
        >
          {renderRichText(blockContent?.rich_text || [])}
        </p>
      );

    case "heading_1":
      const h1Text = getRichText(blockContent?.rich_text);
      if (!h1Text) return null;
      return (
        <h1
          className={cn(
            TYPOGRAPHY.h1.fontSize,
            TYPOGRAPHY.h1.fontWeight,
            "mt-8 mb-4"
          )}
          style={{ color: COLORS.text.primary }}
        >
          {renderRichText(blockContent?.rich_text || [])}
        </h1>
      );

    case "heading_2":
      const h2Text = getRichText(blockContent?.rich_text);
      if (!h2Text) return null;
      return (
        <h2
          className={cn(
            TYPOGRAPHY.h2.fontSize,
            TYPOGRAPHY.h2.fontWeight,
            "mt-6 mb-3"
          )}
          style={{ color: COLORS.text.primary }}
        >
          {renderRichText(blockContent?.rich_text || [])}
        </h2>
      );

    case "heading_3":
      const h3Text = getRichText(blockContent?.rich_text);
      if (!h3Text) return null;
      return (
        <h3
          className={cn(
            TYPOGRAPHY.h3.fontSize,
            TYPOGRAPHY.h3.fontWeight,
            "mt-4 mb-2"
          )}
          style={{ color: COLORS.text.primary }}
        >
          {renderRichText(blockContent?.rich_text || [])}
        </h3>
      );

    case "bulleted_list_item":
      const bulletText = getRichText(blockContent?.rich_text);
      if (!bulletText) return null;
      if (asListItem) {
        return (
          <li
            className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
            style={{ color: COLORS.text.primary }}
          >
            {renderRichText(blockContent?.rich_text || [])}
            {block.children && block.children.length > 0 && (
              <div className="mt-2 space-y-1">
                <NotionBlocks blocks={block.children} onImageError={onImageError} />
              </div>
            )}
          </li>
        );
      }
      return (
        <div className="flex items-start gap-1.5 my-1.5">
          <span
            className="flex-shrink-0 mt-0.5"
            style={{
              color: COLORS.brand.primary,
              fontSize: "0.75rem",
              lineHeight: "1.5",
            }}
          >
            •
          </span>
          <div
            className={cn(
              TYPOGRAPHY.body.fontSize,
              TYPOGRAPHY.body.lineHeight,
              "flex-1"
            )}
            style={{ color: COLORS.text.primary }}
          >
            {renderRichText(blockContent?.rich_text || [])}
            {block.children && block.children.length > 0 && (
              <div className="mt-2 ml-2 space-y-1">
                {block.children.map((child) => (
                  <NotionBlock key={child.id} block={child} />
                ))}
              </div>
            )}
          </div>
        </div>
      );

    case "numbered_list_item":
      const numberedText = getRichText(blockContent?.rich_text);
      if (!numberedText) return null;
      if (asListItem) {
        return (
          <li
            className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
            style={{ color: COLORS.text.primary }}
          >
            {renderRichText(blockContent?.rich_text || [])}
            {block.children && block.children.length > 0 && (
              <div className="mt-2 space-y-1">
                <NotionBlocks blocks={block.children} onImageError={onImageError} />
              </div>
            )}
          </li>
        );
      }
      return (
        <div className="flex items-start gap-1.5 my-1.5">
          <span
            className={cn(
              TYPOGRAPHY.body.fontSize,
              "mt-0.5 flex-shrink-0 font-medium min-w-[1.5rem]"
            )}
            style={{ color: COLORS.brand.primary }}
          >
            {blockContent?.number || "•"}
          </span>
          <div
            className={cn(
              TYPOGRAPHY.body.fontSize,
              TYPOGRAPHY.body.lineHeight,
              "flex-1"
            )}
            style={{ color: COLORS.text.primary }}
          >
            {renderRichText(blockContent?.rich_text || [])}
            {block.children && block.children.length > 0 && (
              <div className="mt-2 ml-2 space-y-1">
                {block.children.map((child) => (
                  <NotionBlock key={child.id} block={child} />
                ))}
              </div>
            )}
          </div>
        </div>
      );

    case "to_do":
      const todoText = getRichText(blockContent?.rich_text);
      if (!todoText) return null;
      return (
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={blockContent?.checked || false}
            readOnly
            className="mt-1 flex-shrink-0"
            style={{ accentColor: COLORS.brand.primary }}
          />
          <div
            className={cn(
              TYPOGRAPHY.body.fontSize,
              TYPOGRAPHY.body.lineHeight,
              "flex-1",
              blockContent?.checked && "line-through opacity-60"
            )}
            style={{ color: COLORS.text.primary }}
          >
            {renderRichText(blockContent?.rich_text || [])}
          </div>
        </div>
      );

    case "toggle":
      return (
        <ToggleBlock
          block={block}
          blockContent={blockContent}
          renderRichText={renderRichText}
          onImageError={onImageError}
        />
      );
    case "image": {
      const imageData = (block as { image?: Record<string, unknown> }).image;
      const imageType = imageData?.type as "external" | "file" | undefined;
      const imageUrl =
        imageType === "external"
          ? (imageData?.external as { url?: string } | undefined)?.url
          : (imageData?.file as { url?: string } | undefined)?.url;
      const caption = imageData?.caption as NotionRichText[] | undefined;

      if (!imageUrl) return null;

      return (
        <figure className="my-4">
          <Image
            src={imageUrl}
            alt={getRichText(caption)}
            width={1080}
            height={1080}
            unoptimized
            sizes="100vw"
            className="w-full rounded-xl"
            style={{ border: `1px solid ${COLORS.border.light}`, height: "auto" }}
            onError={() => onImageError?.(block.id)}
          />
          {caption && caption.length > 0 && (
            <figcaption
              className={cn(TYPOGRAPHY.bodySmall.fontSize, "mt-2")}
              style={{ color: COLORS.text.secondary }}
            >
              {renderRichText(caption)}
            </figcaption>
          )}
        </figure>
      );
    }

    case "quote":
      const quoteText = getRichText(blockContent?.rich_text);
      if (!quoteText) return null;
      return (
        <blockquote
          className="pl-4 border-l-4 my-4"
          style={{
            borderColor: COLORS.brand.primary,
            color: COLORS.text.secondary,
          }}
        >
          <p
            className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
          >
            {renderRichText(blockContent?.rich_text || [])}
          </p>
        </blockquote>
      );

    case "callout":
      const calloutText = getRichText(blockContent?.rich_text);
      const calloutIcon = blockContent?.icon?.emoji;
      const isCarouselCallout = calloutText.includes("캐러셀");
      const carouselImages = isCarouselCallout
        ? (block.children || [])
            .filter((child) => child.type === "image")
            .map((child) => ({
              id: child.id,
              url: getImageUrlFromBlock(child),
            }))
            .filter((image): image is { id: string; url: string } => Boolean(image.url))
        : [];

      if (isCarouselCallout && carouselImages.length > 0) {
        return (
          <div
            className="p-4 rounded-lg my-4"
            style={{
              backgroundColor: `${COLORS.brand.primary}15`,
              border: `1px solid ${COLORS.brand.primary}30`,
            }}
          >
            <Swiper
              spaceBetween={12}
              slidesPerView={1}
              style={{ width: "100%", maxWidth: "360px", margin: "0 auto" }}
            >
              {carouselImages.map((image) => (
                <SwiperSlide key={image.id}>
                  <div
                    className="w-full overflow-hidden rounded-xl"
                    style={{
                      border: `1px solid ${COLORS.border.light}`,
                      aspectRatio: "1 / 1",
                      backgroundColor: COLORS.background.card,
                      position: "relative",
                    }}
                  >
                    <Image
                      src={image.url}
                      alt="carousel image"
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 360px, 360px"
                      className="object-cover"
                      onError={() => onImageError?.(image.id)}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        );
      }
      return (
        <div
          className="p-4 rounded-lg my-4"
          style={{
            backgroundColor: `${COLORS.brand.primary}15`,
            border: `1px solid ${COLORS.brand.primary}30`,
          }}
        >
          <div className="flex items-start gap-3">
            {calloutIcon && (
              <span className="text-xl flex-shrink-0">{calloutIcon}</span>
            )}
            <div
              className={cn(
                TYPOGRAPHY.body.fontSize,
                TYPOGRAPHY.body.lineHeight,
                "flex-1"
              )}
              style={{ color: COLORS.text.primary }}
            >
              {calloutText ? renderRichText(blockContent?.rich_text || []) : null}
              {block.children && block.children.length > 0 && (
                <div className="mt-2 space-y-2">
                  <NotionBlocks
                    blocks={block.children}
                    onImageError={onImageError}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      );

    case "code":
      const codeText = getRichText(blockContent?.rich_text);
      if (!codeText) return null;
      return (
        <pre
          className="p-4 rounded-lg overflow-x-auto my-4"
          style={{
            backgroundColor: COLORS.background.card,
            border: `1px solid ${COLORS.border.light}`,
          }}
        >
          <code
            className={cn(TYPOGRAPHY.bodySmall.fontSize)}
            style={{ color: COLORS.text.primary }}
          >
            {codeText}
          </code>
        </pre>
      );

    case "divider":
      return (
        <hr
          className="my-6"
          style={{ borderColor: COLORS.border.light }}
        />
      );

    case "table":
      // 테이블은 children(table_row)을 렌더링
      if (!block.children || block.children.length === 0) return null;
      
      return (
        <div className="my-6 overflow-x-auto">
          <table
            className="w-full border-collapse"
            style={{
              border: `1px solid ${COLORS.border.light}`,
            }}
          >
            <tbody>
              {block.children.map((row: NotionBlock, rowIndex: number) => {
                const rowContent = row[row.type] as NotionBlockContent | undefined;
                const cells = rowContent?.cells || [];
                
                return (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: `1px solid ${COLORS.border.light}`,
                      backgroundColor: rowIndex % 2 === 0 ? "transparent" : `${COLORS.background.hover}40`,
                    }}
                  >
                    {cells.map((cell: NotionRichText[], cellIndex: number) => {
                      const isHeader = rowIndex === 0 && !!blockContent?.table_width;
                      
                      return (
                        <td
                          key={cellIndex}
                          className={cn(
                            "px-4 py-2",
                            isHeader ? "font-semibold" : undefined
                          )}
                          style={{
                            borderRight: cellIndex < cells.length - 1 ? `1px solid ${COLORS.border.light}` : "none",
                            backgroundColor: isHeader ? `${COLORS.background.hover}60` : "transparent",
                            color: COLORS.text.primary,
                          }}
                        >
                          {cell && cell.length > 0 ? (
                            <div
                              className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
                            >
                              {renderRichText(cell)}
                            </div>
                          ) : (
                            <span style={{ color: COLORS.text.tertiary }}>&nbsp;</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );

    case "table_row":
      // table_row는 table의 children으로만 사용되므로 여기서는 처리하지 않음
      // (table 케이스에서 이미 처리됨)
      return null;

    default:
      // 알 수 없는 블록 타입은 텍스트로만 표시
      const defaultText = getRichText(blockContent?.rich_text);
      if (!defaultText) return null;
      return (
        <div
          className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
          style={{ color: COLORS.text.secondary }}
        >
          {renderRichText(blockContent?.rich_text || [])}
        </div>
      );
  }
}

/**
 * 토글 블록을 드롭다운 형식으로 렌더링
 */
function ToggleBlock({
  block,
  blockContent,
  renderRichText,
  onImageError,
}: {
  block: NotionBlock;
  blockContent: NotionBlockContent | undefined;
  renderRichText: (richText: NotionRichText[] | undefined) => React.ReactNode;
  onImageError?: (blockId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="mb-4 rounded-xl overflow-hidden transition-all duration-200 relative"
      style={{
        backgroundColor: "#FAFAF8",
        border: `1.5px solid ${COLORS.border.light}`,
        borderRadius: "12px",
        boxShadow: `
          0 2px 8px rgba(0,0,0,0.04),
          0 1px 3px rgba(0,0,0,0.02),
          inset 0 1px 0 rgba(255,255,255,0.6)
        `,
        position: "relative",
        overflow: "hidden",
        // 종이 질감 배경 패턴
        backgroundImage: `
          /* 가로 줄무늬 (프로젝트 그린 톤) */
          repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 27px,
            rgba(107, 122, 111, 0.08) 27px,
            rgba(107, 122, 111, 0.08) 28px
          ),
          /* 종이 텍스처 노이즈 */
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(107, 122, 111, 0.01) 2px,
            rgba(107, 122, 111, 0.01) 4px
          )
        `,
        backgroundSize: "100% 28px, 8px 8px",
        backgroundPosition: "0 2px, 0 0",
        filter: "contrast(1.02) brightness(1.01)",
      }}
    >
      {/* 종이 질감 오버레이 */}
      <div
        className="absolute inset-0 pointer-events-none rounded-xl"
        style={{
          background: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 40%),
            radial-gradient(circle at 75% 75%, ${COLORS.brand.light}15 0%, transparent 40%)
          `,
          mixBlendMode: "overlay",
          opacity: 0.5,
          overflow: "hidden",
        }}
      />

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left transition-all duration-200 relative z-10"
        style={{
          backgroundColor: "transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "0.85";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
      >
        <div
          className={cn(
            TYPOGRAPHY.body.fontSize,
            TYPOGRAPHY.body.fontWeight,
            "flex-1 pr-4"
          )}
          style={{ color: COLORS.text.primary }}
        >
          {blockContent?.rich_text && blockContent.rich_text.length > 0
            ? renderRichText(blockContent.rich_text)
            : "토글"}
        </div>
        <div
          className="flex-shrink-0 transition-transform duration-200"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <ChevronDown
            className="w-5 h-5"
            style={{ color: COLORS.text.secondary }}
          />
        </div>
      </button>

      {isOpen && block.children && block.children.length > 0 && (
        <div
          className="px-5 pb-4 pt-2 space-y-3 border-t relative z-10"
          style={{
            borderColor: COLORS.border.light + "40",
            animation: "fadeInSlideDown 0.2s ease-out",
            backgroundColor: "transparent",
          }}
        >
          <NotionBlocks blocks={block.children} onImageError={onImageError} />
        </div>
      )}
    </div>
  );
}
