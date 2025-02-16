import {ChevronRightIcon, DocumentIcon, FolderIcon} from '@sanity/icons'
import {
  isSanityDocument,
  type PreviewValue,
  type SanityDocument,
  type SchemaType,
} from '@sanity/types'
import {Box, type CardProps, Text} from '@sanity/ui'
import {
  type ComponentType,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  type FIXME,
  type GeneralPreviewLayoutKey,
  PreviewCard,
  SanityDefaultPreview,
  useDocumentPresence,
  useDocumentPreviewStore,
  useSchema,
} from 'sanity'

import {MissingSchemaType} from '../MissingSchemaType'
import {usePaneRouter} from '../paneRouter'
import {PaneItemPreview} from './PaneItemPreview'

interface PaneItemProps {
  id: string
  layout?: GeneralPreviewLayoutKey
  icon?: ComponentType<any> | false
  pressed?: boolean
  selected?: boolean
  title?: string
  value?: PreviewValue | SanityDocument
  schemaType?: SchemaType
  margin?: CardProps['margin']
  marginBottom?: CardProps['marginBottom']
  marginTop?: CardProps['marginTop']
}

/**
 * Return `false` if we explicitly disable the icon.
 * Otherwise return the passed icon or the schema type icon as a backup.
 */
export function getIconWithFallback(
  icon: ComponentType<any> | false | undefined,
  schemaType: SchemaType | undefined,
  defaultIcon: ComponentType<any>,
): ComponentType<any> | false {
  if (icon === false) {
    return false
  }

  return icon || (schemaType && schemaType.icon) || defaultIcon || false
}

export function PaneItem(props: PaneItemProps) {
  const {
    icon,
    id,
    layout = 'default',
    pressed,
    schemaType,
    selected,
    title,
    value,
    margin,
    marginBottom,
    marginTop,
  } = props
  const schema = useSchema()
  const documentPreviewStore = useDocumentPreviewStore()
  const {ChildLink} = usePaneRouter()
  const documentPresence = useDocumentPresence(id)
  const hasSchemaType = Boolean(schemaType && schemaType.name && schema.get(schemaType.name))
  const [clicked, setClicked] = useState<boolean>(false)

  const preview = useMemo(() => {
    if (value && isSanityDocument(value)) {
      if (!schemaType || !hasSchemaType) {
        return <MissingSchemaType value={value} />
      }

      return (
        <PaneItemPreview
          documentPreviewStore={documentPreviewStore}
          icon={getIconWithFallback(icon, schemaType, DocumentIcon)}
          layout={layout}
          schemaType={schemaType}
          value={value}
          presence={documentPresence}
        />
      )
    }

    // Always render non-document values as compact previews
    return (
      <SanityDefaultPreview
        status={
          <Box style={{opacity: 0.5}}>
            <Text muted size={1}>
              <ChevronRightIcon />
            </Text>
          </Box>
        }
        icon={getIconWithFallback(icon, schemaType, FolderIcon)}
        layout="compact"
        title={title}
      />
    )
  }, [
    documentPreviewStore,
    hasSchemaType,
    icon,
    layout,
    schemaType,
    title,
    value,
    documentPresence,
  ])

  const Link = useMemo(
    () =>
      function LinkComponent(linkProps: {children: ReactNode}) {
        return <ChildLink {...linkProps} childId={id} />
      },
    [ChildLink, id],
  )

  const handleClick = useCallback((e: MouseEvent<HTMLElement>) => {
    if (e.metaKey) {
      setClicked(false)
      return
    }

    setClicked(true)
  }, [])

  // Reset `clicked` state when `selected` prop changes
  useEffect(() => setClicked(false), [selected])

  return (
    <PreviewCard
      __unstable_focusRing
      as={Link as FIXME}
      data-as="a"
      margin={margin}
      marginBottom={marginBottom}
      marginTop={marginTop}
      onClick={handleClick}
      pressed={pressed}
      radius={2}
      selected={selected || clicked}
      sizing="border"
      tabIndex={-1}
      tone="inherit"
    >
      {preview}
    </PreviewCard>
  )
}
