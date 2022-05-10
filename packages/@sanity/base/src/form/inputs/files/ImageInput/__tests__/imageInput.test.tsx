/* eslint-disable @typescript-eslint/no-non-null-assertion */

import React from 'react'
import {fireEvent, waitFor} from '@testing-library/react'
import imageUrlBuilder from '@sanity/image-url'
import {SchemaType} from '@sanity/types'
import {EMPTY, of} from 'rxjs'
import {ImageInput, ImageInputProps} from '../ImageInput'
import {UploadOptions} from '../../../../studio/uploads/types'
import {FIXME} from '../../../../types'
import {renderInput} from '../../../../test/renderInput'

const imagesTest = {
  name: 'imagesTest',
  type: 'document',
  title: 'Images test',
  description: 'Different test cases of image fields',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'mainImage',
      title: 'Image',
      type: 'image',
      description:
        'Image hotspot should be possible to change. Caption should be visible in image field, full description should be editable in modal',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
          options: {
            isHighlighted: true,
          },
        },
        {
          name: 'detailedCaption',
          type: 'string',
          title: 'Detailed caption',
          options: {
            isHighlighted: true,
          },
          hidden: ({parent}: any) => !parent?.caption,
        },
        {
          name: 'foo',
          type: 'string',
          title:
            'This is a rather longish title for a field. It should still work. This is a rather longish title for a field. It should still work.',
          options: {
            isHighlighted: true,
          },
        },
        {
          name: 'description',
          type: 'string',
          title: 'Full description',
        },
      ],
    },
  ],
}

const resolveUploaderStub = () => ({
  priority: 1,
  type: 'image',
  accepts: 'image/*',
  upload: (file: File, type?: SchemaType, options?: UploadOptions) => EMPTY,
})

const observeAssetStub = (id: string) =>
  of({
    _id: id,
    _type: 'sanity.imageAsset' as const,
    _createdAt: '2021-06-30T08:16:55Z',
    _rev: 'x3HeExLNg9nMfqQGwLDqyZ',
    _updatedAt: '2021-06-30T08:16:55Z',
    assetId: '47b2fbcdb38bee39c02064b218b47a17de808945',
    extension: 'jpg',
    metadata: {
      _type: 'sanity.imageMetadata' as const,
      dimensions: {
        _type: 'sanity.imageDimensions' as const,
        aspectRatio: 0.75,
        height: 3648,
        width: 2736,
      },
      hasAlpha: false,
      isOpaque: true,
    },
    mimeType: 'image/jpeg',
    originalFilename: '2021-06-23 08.10.04.jpg',
    path: 'images/ppsg7ml5/test/47b2fbcdb38bee39c02064b218b47a17de808945-2736x3648.jpg',
    sha1hash: '47b2fbcdb38bee39c02064b218b47a17de808945',
    size: 4277677,
    uploadId: 'OLknm0kCxeXuzlxbcBHaRzmRWCHIbIYu',
    url: 'https://cdn.sanity.io/images/ppsg7ml5/test/47b2fbcdb38bee39c02064b218b47a17de808945-2736x3648.jpg',
  })

const imageUrlBuilderStub = imageUrlBuilder({
  dataset: 'some-dataset',
  projectId: 'some-project-id',
})

const defaultProps: Partial<ImageInputProps> = {
  resolveUploader: resolveUploaderStub,
  observeAsset: observeAssetStub,
  directUploads: true,
  assetSources: [{} as FIXME],
  imageUrlBuilder: imageUrlBuilderStub,
  path: ['image'],
}

function renderImageInput(options: {props?: Partial<ImageInputProps>; type: any}) {
  return renderInput<any>({
    ...options,
    render: (props) => <ImageInput {...defaultProps} {...props} />,
  })
}

describe('ImageInput with empty state', () => {
  it('renders an empty input as default', () => {
    const {result} = renderImageInput({type: imagesTest})
    expect(result.queryByTestId('file-button-input')!.getAttribute('value')).toBe('')
    expect(result.queryByText('Drag or paste image here')).toBeInTheDocument()
  })

  it.todo('renders new image when a new image in uploaded')
  it.todo('renders new image when a new image is dragged into the input')
  it.todo('is unable to upload when the file type is not allowed')

  /* assetSources - adds a list of sources that a user can pick from when browsing */

  it('renders the browse button when it has at least one element in assetSources', () => {
    // const {queryByTestId} = render(<ImageInput />)
    const {result} = renderImageInput({type: imagesTest})

    expect(result.queryByTestId('file-input-upload-button')).toBeInTheDocument()
    expect(result.queryByTestId('file-input-browse-button')).toBeInTheDocument()
  })

  it('renders only the upload button when it has no assetSources', () => {
    // const {queryByTestId} = render(<ImageInput assetSources={[]} />)
    const {result} = renderImageInput({
      props: {
        assetSources: [],
      },
      type: imagesTest,
    })

    expect(result.queryByTestId('file-input-upload-button')).toBeInTheDocument()
    expect(result.queryByTestId('file-input-browse-button')).not.toBeInTheDocument()
  })

  it('renders the browse button with a tooltip when it has at least one element in assetSources', async () => {
    const {result} = renderImageInput({
      props: {
        assetSources: [{name: 'source1'} as FIXME, {name: 'source2'} as FIXME],
      },
      type: imagesTest,
    })
    const browseButton = result.queryByTestId('file-input-multi-browse-button')

    expect(result.queryByTestId('file-input-upload-button')).toBeInTheDocument()
    expect(browseButton).toBeInTheDocument()

    fireEvent.click(browseButton!)

    await waitFor(() => {
      expect(result.queryByTestId('file-input-browse-button-source1')).toBeInTheDocument()
      expect(result.queryByTestId('file-input-browse-button-source2')).toBeInTheDocument()
    })
  })

  /* directUploads - allows for user to upload images directly (default is true) */

  it('renders the upload button as disabled when directUploads is false', () => {
    // const {queryByTestId} = render(<ImageInput directUploads={false} />)
    const {result} = renderImageInput({
      props: {
        directUploads: false,
      },
      type: imagesTest,
    })

    expect(result.queryByTestId('file-input-upload-button')!.getAttribute('data-disabled')).toBe(
      'true'
    )
  })

  it('has default text that mentions that you cannot upload images when directUploads is false', async () => {
    // const {queryByText} = render(<ImageInput directUploads={false} />)
    const {result} = renderImageInput({
      props: {
        directUploads: false,
      },
      type: imagesTest,
    })

    expect(result.queryByText(`Can't upload files here`)).toBeInTheDocument()
  })

  /* readOnly - the image input is read only or not */

  it('the upload button is disabled when the input is readOnly', () => {
    // const {queryByTestId} = render(<ImageInput readOnly />)
    const {result} = renderImageInput({
      props: {
        readOnly: true,
      },
      type: imagesTest,
    })

    expect(result.queryByTestId('file-input-upload-button')!.getAttribute('data-disabled')).toBe(
      'true'
    )
  })

  it('does not allow for browsing when input is readOnly', () => {
    // const {queryByTestId} = render(<ImageInput readOnly />)
    const {result} = renderImageInput({
      props: {
        readOnly: true,
      },
      type: imagesTest,
    })

    expect(result.queryByTestId('file-input-browse-button')!.getAttribute('data-disabled')).toBe(
      'true'
    )
  })

  it('does not allow for upload when input is readOnly', async () => {
    // const {queryByTestId, queryByText} = render(<ImageInput readOnly />)
    const {result} = renderImageInput({
      props: {
        readOnly: true,
      },
      type: imagesTest,
    })

    const input = result.queryByTestId('file-button-input')

    fireEvent.change(input!, {
      target: {
        files: [new File(['(⌐□_□)'], 'cool_sunglasses.png', {type: 'image/png'})],
      },
    })

    await waitFor(() => {
      expect(result.queryByText(`Read only`)).toBeInTheDocument()
    })
  })

  it.todo('does not allow files to be dragged & uploaded when it is readOnly')
})

describe('ImageInput with asset', () => {
  const value = {
    asset: {
      _ref: 'image-4ae478f00c330e7089cbd0f6126d3626e432e595-702x908-png',
      _type: 'reference',
    },
    _type: 'image',
  }

  const imageType = {
    options: {
      accept: 'image/png',
      hotspot: true,
    },
  }

  it('renders the right url as default when it has asset', () => {
    // const {queryByTestId} = render(<ImageInput value={value} />)
    const {result} = renderImageInput({
      props: {value},
      type: imagesTest,
    })

    expect(result.queryByTestId('hotspot-image-input')!.getAttribute('src')).toBe(
      'https://cdn.sanity.io/images/some-project-id/some-dataset/4ae478f00c330e7089cbd0f6126d3626e432e595-702x908.png?w=2000&fit=max&auto=format'
    )
  })

  it.todo('renders new image when a new image in uploaded')
  it.todo('renders new image when a new image is dragged into the input')
  it.todo('is unable to upload when the file type is not allowed')

  /* assetSources - adds a list of sources that a user can pick from when browsing */

  it('renders the browse button in the image menu when it has at least one element in assetSources', async () => {
    // const {queryByTestId} = render(<ImageInput value={value} />)
    const {result} = renderImageInput({
      props: {value},
      type: imagesTest,
    })
    fireEvent.click(result.queryByTestId('options-menu-button')!)

    await waitFor(() => {
      expect(result.queryByTestId('file-input-browse-button')).toBeInTheDocument()
    })
  })

  it('renders the browse button in the image menu when it has no assetSources', async () => {
    // const {queryByTestId} = render(<ImageInput value={value} assetSources={[]} />)
    const {result} = renderImageInput({
      props: {assetSources: [], value},
      type: imagesTest,
    })

    fireEvent.click(result.queryByTestId('options-menu-button')!)

    await waitFor(() => {
      expect(result.queryByTestId('file-input-upload-button')).toBeInTheDocument()
      expect(result.queryByTestId('file-input-browse-button')).not.toBeInTheDocument()
    })
  })

  it('renders the multiple browse buttons in the image menu when it has multiple assetSources', async () => {
    // const {queryByTestId} = render(
    //   <ImageInput value={value} assetSources={[{name: 'source1'}, {name: 'source2'}]} />
    // )
    const {result} = renderImageInput({
      props: {
        assetSources: [{name: 'source1'} as FIXME, {name: 'source2'} as FIXME],
        value,
      },
      type: imagesTest,
    })

    fireEvent.click(result.queryByTestId('options-menu-button')!)

    await waitFor(() => {
      expect(result.queryByTestId('file-input-browse-button-source1')).toBeInTheDocument()
      expect(result.queryByTestId('file-input-browse-button-source2')).toBeInTheDocument()
    })
  })

  /* directUploads - allows for user to upload images directly (default is true) */

  it('renders the upload button as disabled when directUploads is false', async () => {
    // const {queryByTestId} = render(<ImageInput value={value} directUploads={false} />)
    const {result} = renderImageInput({
      props: {
        directUploads: false,
        value,
      },
      type: imagesTest,
    })

    fireEvent.click(result.queryByTestId('options-menu-button')!)

    await waitFor(() => {
      expect(result.queryByTestId('file-input-upload-button')!.getAttribute('data-disabled')).toBe(
        ''
      )
    })
  })

  /* readOnly - the image input is read only or not */

  it('the upload button in the dropdown menu is disabled when the input is readOnly', async () => {
    // const {queryByTestId} = render(<ImageInput value={value} readOnly />)
    const {result} = renderImageInput({
      props: {
        readOnly: true,
        value,
      },
      type: imagesTest,
    })

    fireEvent.click(result.queryByTestId('options-menu-button')!)

    await waitFor(() => {
      expect(result.queryByTestId('file-input-upload-button')!.getAttribute('data-disabled')).toBe(
        ''
      )
    })
  })

  it('does not allow for browsing when input is readOnly', async () => {
    // const {queryByTestId} = render(<ImageInput value={value} readOnly />)
    const {result} = renderImageInput({
      props: {
        readOnly: true,
        value,
      },
      type: imagesTest,
    })

    fireEvent.click(result.queryByTestId('options-menu-button')!)

    await waitFor(() => {
      expect(result.queryByTestId('file-input-browse-button')!.hasAttribute('data-disabled'))
    })
  })

  it('does not allow for browsing with multiple sources when input is readOnly', async () => {
    // const {queryByTestId} = render(
    //   <ImageInput value={value} assetSources={[{name: 'source1'}, {name: 'source2'}]} readOnly />
    // )

    const {result} = renderImageInput({
      props: {
        assetSources: [{name: 'source1'} as FIXME, {name: 'source2'} as FIXME],
        readOnly: true,
        value,
      },
      type: imagesTest,
    })

    fireEvent.click(result.queryByTestId('options-menu-button')!)

    await waitFor(() => {
      expect(
        result.queryByTestId('file-input-browse-button-source1')!.hasAttribute('data-disabled')
      )
      expect(
        result.queryByTestId('file-input-browse-button-source2')!.hasAttribute('data-disabled')
      )
    })
  })

  it('does not allow for clearing the image when input is readOnly', async () => {
    // const {queryByTestId} = render(<ImageInput value={value} readOnly />)
    const {result} = renderImageInput({
      props: {
        readOnly: true,
        value,
      },
      type: imagesTest,
    })

    fireEvent.click(result.queryByTestId('options-menu-button')!)

    await waitFor(() => {
      expect(result.queryByTestId('file-input-clear')!.hasAttribute('data-disabled'))
    })
  })

  it('can open the edit details (if the option exists) dialog when the input is readOnly', async () => {
    // const {queryByTestId} = render(<ImageInput value={value} type={imageType} readOnly />)
    const {result} = renderImageInput({
      props: {
        readOnly: true,
        value,
      },
      type: {...imagesTest, ...imageType},
    })

    expect(result.queryByTestId('options-menu-edit-details')!.getAttribute('data-disabled')).toBe(
      'false'
    )
  })

  it('does not allow for upload when input is readOnly & the image src is the same', async () => {
    // const {queryByTestId} = render(<ImageInput value={value} type={imageType} readOnly />)
    const {result} = renderImageInput({
      props: {
        readOnly: true,
        value,
      },
      type: {...imagesTest, ...imageType},
    })

    fireEvent.click(result.queryByTestId('options-menu-button')!)

    fireEvent.change(result.queryByTestId('file-button-input')!, {
      target: {
        files: [new File(['(⌐□_□)'], 'cool_sunglasses.png', {type: 'image/png'})],
      },
    })

    await waitFor(() => {
      expect(result.queryByTestId('hotspot-image-input')!.getAttribute('src')).toBe(
        'https://cdn.sanity.io/images/some-project-id/some-dataset/4ae478f00c330e7089cbd0f6126d3626e432e595-702x908.png?w=2000&fit=max&auto=format'
      )
    })
  })

  it.todo('does not allow files to be dragged & uploaded when it is readOnly')

  /* shows / hides edit details */

  it('hides the editing details if it doesnt have hotspot set', () => {
    const {result} = renderImageInput({
      props: {
        value,
      },
      type: {...imagesTest, ...imageType},
    })

    // const {queryByTestId} = render(<ImageInput value={value} type={imageType} />)
    expect(result.queryByTestId('options-menu-edit-details')).toBeInTheDocument()
  })
})
