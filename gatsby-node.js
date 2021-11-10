const path = require('path')

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  // Define a template for blog post
  const jediPost = path.resolve('./src/templates/jedi-post.js')

  const result = await graphql(
    `
      {
        allContentfulJedi {
          nodes {
            name
          }
        }
      }
    `
  )

  if (result.errors) {
    reporter.panicOnBuild(
      `There was an error loading your Contentful posts`,
      result.errors
    )
    return
  }

  const jedi = result.data.allContentfulJedi.nodes

  // Create jedi post pages
  // But only if there's at least one jedi post found in Contentful
  // `context` is available in the template as a prop and as a variable in GraphQL

  if (jedi.length > 0) {
    jedi.forEach((singleJedi, index) => {
      const previousPostName = index === 0 ? null : jedi[index - 1].name
      const nextPostName =
        index === jedi.length - 1 ? null : jedi[index + 1].name

      createPage({
        path: `/jedi/${singleJedi.name}/`,
        component: jediPost,
        context: {
          name: singleJedi.name,
          previousPostName,
          nextPostName,
        },
      })
    })
  }
}
