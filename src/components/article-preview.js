import React from 'react'
import { Link } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
import { renderRichText } from 'gatsby-source-contentful/rich-text'
import renderOptions from '../richtext-render/options-render'
import Container from './container'
import Tags from './tags'
import * as styles from './article-preview.module.css'

const ArticlePreview = ({ forceUsers, type }) => {
  if (!forceUsers) return null
  if (!Array.isArray(forceUsers)) return null

  return (
    <Container>
      <ul className={styles.articleList}>
        {forceUsers.map((forceUser) => {
          return (
            <li key={forceUser.name}>
              <Link to={`/${type}/${forceUser.name}`} className={styles.link}>
                <GatsbyImage
                  alt="avatar"
                  image={forceUser.avatar.gatsbyImageData}
                />
                <h2 className={styles.title}>{forceUser.name}</h2>
              </Link>
              <div>{renderRichText(forceUser.description, renderOptions)}</div>
              <div className={styles.meta}>
                <small className="meta">{forceUser.publishDate}</small>
                <Tags tags={forceUser.type} />
              </div>
            </li>
          )
        })}
      </ul>
    </Container>
  )
}

export default ArticlePreview
