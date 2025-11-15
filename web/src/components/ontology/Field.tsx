/**
 * Field Component - Universal Field Renderer
 *
 * Renders fields based on their configuration from the ontology.
 * Routes to appropriate component based on field type.
 */

import { type FieldUI, type Thing } from "@/lib/ontology/types";

// shadcn/ui components
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

// Custom field components
import { Heading } from "./fields/Heading";
import { Text } from "./fields/Text";
import { Price } from "./fields/Price";
import { Image } from "./fields/Image";
import { TagList } from "./fields/TagList";
import { DateField } from "./fields/DateField";
import { Link } from "./fields/Link";
import { Markdown } from "./fields/Markdown";

export interface FieldProps {
  name: string;
  value: any;
  config: FieldUI;
  thing: Thing;
}

export function Field({ name, value, config, thing }: FieldProps) {
  // Handle null/undefined values
  if (value === null || value === undefined) {
    return null;
  }

  // Apply formatting function if provided
  const formattedValue = config.format ? config.format(value, thing) : value;

  // Render appropriate component based on config.component
  switch (config.component) {
    case "Heading":
      return (
        <Heading
          size={config.size}
          weight={config.weight}
          truncate={config.truncate}
        >
          {formattedValue}
        </Heading>
      );

    case "Text":
      return (
        <Text
          size={config.size}
          color={config.color}
          lines={config.lines}
          icon={config.icon}
          italic={config.italic}
          weight={config.weight}
          expandable={config.expandable}
        >
          {formattedValue}
        </Text>
      );

    case "Price":
      return (
        <Price
          value={formattedValue}
          currency={config.currency}
          format={config.format as any}
          badge={config.badge}
          size={config.size}
          strikethrough={config.strikethrough}
          free={config.free}
        />
      );

    case "Image":
      return (
        <Image
          src={formattedValue}
          alt={thing.name}
          aspect={config.aspect}
          lazy={config.lazy}
          placeholder={config.placeholder}
          fallback={config.fallback}
          sizes={config.sizes}
        />
      );

    case "Badge":
      const badgeLabel = config.labels?.[value] || config.label || value;
      const badgeVariant = config.colors?.[value] || config.color || "secondary";

      return <Badge variant={badgeVariant as any}>{badgeLabel}</Badge>;

    case "TagList":
      return (
        <TagList
          tags={formattedValue}
          max={config.max}
          color={config.color}
          moreLabel={config.moreLabel}
        />
      );

    case "Date":
      return (
        <DateField
          value={formattedValue}
          format={config.format as any}
          icon={config.icon}
          size={config.size}
          color={config.color}
        />
      );

    case "Markdown":
      return (
        <Markdown
          content={formattedValue}
          className={config.className}
          lines={config.lines}
          expandable={config.expandable}
        />
      );

    case "Avatar":
      return (
        <Avatar className={config.size === "sm" ? "h-8 w-8" : "h-10 w-10"}>
          <AvatarImage src={formattedValue} alt={thing.name} />
          <AvatarFallback>
            {config.fallback === "initials"
              ? thing.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
              : config.fallback}
          </AvatarFallback>
        </Avatar>
      );

    case "Link":
      return (
        <Link
          href={formattedValue}
          icon={config.icon}
          external={config.external}
          size={config.size}
        >
          {config.label || formattedValue}
        </Link>
      );

    case "Checkbox":
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={formattedValue}
            onCheckedChange={(checked) => {
              // TODO: Update thing property
              console.log("Checkbox changed:", name, checked);
            }}
          />
          {config.label && (
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {config.label}
            </label>
          )}
        </div>
      );

    case "Switch":
      return (
        <div className="flex items-center space-x-2">
          <Switch
            checked={formattedValue}
            onCheckedChange={(checked) => {
              // TODO: Update thing property
              console.log("Switch changed:", name, checked);
            }}
          />
          {config.label && (
            <label className="text-sm font-medium">{config.label}</label>
          )}
        </div>
      );

    case "Progress":
      return (
        <div className="space-y-2">
          {config.label && (
            <div className="flex justify-between text-sm">
              <span>{config.label}</span>
              <span>{formattedValue}%</span>
            </div>
          )}
          <Progress value={formattedValue} />
        </div>
      );

    case "Separator":
      return <Separator />;

    case "Skeleton":
      return <Skeleton className={config.className} />;

    default:
      console.warn(`Unknown field component: ${config.component}`);
      return <Text size="sm">{String(formattedValue)}</Text>;
  }
}
