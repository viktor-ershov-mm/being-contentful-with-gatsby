import React from 'react'
import { GatsbyImage } from 'gatsby-plugin-image'
import { renderRichText } from 'gatsby-source-contentful/rich-text'
import renderOptions from '../richtext-render/options-render'
import * as styles from './hero.module.css'

const Hero = ({ image, title, content }) => (
  <div className={styles.hero}>
    {image && (
      <GatsbyImage className={styles.image} alt={title} image={image} />
    )}
    <div className={styles.details}>
      <h1 className={styles.title}>{title}</h1>
      {content && content.raw === undefined && (
        <p className={styles.content}>{content}</p>
      )}
    </div>
  </div>
)

export default Hero
