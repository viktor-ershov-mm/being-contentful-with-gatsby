//
// Options object to pass into renderRichText
//
// We use this file to format the display of certain assets, entries,
// and hyperlinks within Rich Text fields to give Content Editors the
// flexibility they need to create dynamic content on the fly
//

/* eslint no-underscore-dangle: 0 */
/* eslint  dot-notation: 0 */
/* eslint  no-nested-ternary: 0 */
import { BLOCKS, INLINES } from '@contentful/rich-text-types'
import { GatsbyImage, getImage } from 'gatsby-plugin-image'
import React from 'react'

const rendererOptions = {
  renderText: (text1) =>
    text1.split('\n').flatMap((text2, i) => [i > 0 && <br />, text2]),
  renderNode: {
    [BLOCKS.EMBEDDED_ENTRY]: (node) => {
      const { data } = node
      const { target } = data

      if (target) {
        if (target.__typename === 'ContentfulLightsaber') {
          const { title, image } = target
          return (
            <>
              <p>{title}</p>
              <GatsbyImage
                alt={title}
                data-cy="gatsby-img"
                image={getImage(image)}
              />
            </>
          )
        }
      }
      return null
    },
  },
}

export default rendererOptions
