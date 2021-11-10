import React from 'react'
import { graphql } from 'gatsby'
import get from 'lodash/get'

import Layout from '../components/layout'
import Hero from '../components/hero'
import ArticlePreview from '../components/article-preview'

class RootIndex extends React.Component {
  render() {
    const jedi = get(this, 'props.data.allContentfulJedi.nodes')
    const [homepage] = get(this, 'props.data.allContentfulHomepage.nodes')

    return (
      <Layout location={this.props.location}>
        <Hero
          image={homepage.homepageImage.gatsbyImageData}
          title={homepage.name}
          content={homepage.shortDescription.shortDescription}
        />
        <ArticlePreview forceUsers={jedi} />
      </Layout>
    )
  }
}

export default RootIndex

export const pageQuery = graphql`
  query HomeQuery {
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
    allContentfulHomepage(
      filter: { contentful_id: { eq: "5o5NW1fsGyA46f3EDGTRbw" } }
    ) {
      nodes {
        name
        shortDescription {
          shortDescription
        }
        homepageImage {
          gatsbyImageData(
            layout: CONSTRAINED
            placeholder: BLURRED
            width: 1180
          )
        }
      }
    }
  }
`
