import React from 'react'
import { Link, graphql } from 'gatsby'
import get from 'lodash/get'
import { renderRichText } from 'gatsby-source-contentful/rich-text'
import renderOptions from '../richtext-render/options-render'
import Layout from '../components/layout'
import Hero from '../components/hero'
import Tags from '../components/tags'
import * as styles from './jedi-post.module.css'

class JediTemplate extends React.Component {
  render() {
    const post = get(this.props, 'data.contentfulJedi')
    const previous = get(this.props, 'data.previous')
    const next = get(this.props, 'data.next')

    return (
      <Layout location={this.props.location}>
        {/* <Seo
          title={post.name}
          description={post.description.childMarkdownRemark.excerpt}
          image={`http:${post.heroImage.resize.src}`}
        /> */}
        <Hero
          image={post.avatar.gatsbyImageData}
          title={post.name}
          content={post.description}
        />
        <div className={styles.container}>
          {/* <span className={styles.meta}>
            {post.author.name} &middot;{' '}
            <time dateTime={post.rawDate}>{post.publishDate}</time> –{' '}
            {post.body.childMarkdownRemark.timeToRead} minute read
          </span> */}
          <div className={styles.article}>
            <div>{renderRichText(post.description, renderOptions)}</div>
            <Tags tags={post.type} />
            {(previous || next) && (
              <nav>
                <ul className={styles.articleNavigation}>
                  {previous && (
                    <li>
                      <Link to={`/jedi/${previous.name}`} rel="prev">
                        ← {previous.name}
                      </Link>
                    </li>
                  )}
                  {next && (
                    <li>
                      <Link to={`/jedi/${next.name}`} rel="next">
                        {next.name} →
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>
            )}
          </div>
        </div>
      </Layout>
    )
  }
}

export default JediTemplate

export const pageQuery = graphql`
  query JedyByName(
    $name: String!
    $previousPostName: String
    $nextPostName: String
  ) {
    contentfulJedi(name: { eq: $name }) {
      name
      publishDate(formatString: "MMMM Do, YYYY")
      avatar {
        gatsbyImageData(
          layout: FULL_WIDTH
          placeholder: BLURRED
          width: 424
          height: 212
        )
      }
      type
      description {
        raw
      }
    }
    previous: contentfulJedi(name: { eq: $previousPostName }) {
      name
    }
    next: contentfulJedi(name: { eq: $nextPostName }) {
      name
    }
  }
`
