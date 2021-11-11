import React from 'react'
import { graphql } from 'gatsby'
import get from 'lodash/get'

import Seo from '../components/seo'
import Layout from '../components/layout'
import Hero from '../components/hero'
import ArticlePreview from '../components/article-preview'

class JediIndex extends React.Component {
  render() {
    const posts = get(this, 'props.data.allContentfulJedi.nodes')

    return (
      <Layout location={this.props.location}>
        <Seo title="Jedi" />
        <Hero title="Jedi" />
        <ArticlePreview forceUsers={posts} type="jedi" />
      </Layout>
    )
  }
}

export default JediIndex

export const pageQuery = graphql`
  query JediIndexQuery {
    allContentfulJedi(sort: { fields: [publishDate], order: DESC }) {
      nodes {
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
    }
  }
`
