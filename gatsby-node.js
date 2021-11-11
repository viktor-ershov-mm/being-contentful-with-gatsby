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

  const types = [
    {
      entries: jedi,
      faction: 'jedi',
      template: jediPost,
    },
  ]

  // Create post pages
  // But only if there's at least one jedi post found in Contentful
  // `context` is available in the template as a prop and as a variable in GraphQL

  types.forEach((type) => {
    type.entries.forEach((forceUser, index) => {
      const previousPostName = index === 0 ? null : type.entries[index - 1].name
      const nextPostName =
        index === type.entries.length - 1 ? null : type.entries[index + 1].name

      createPage({
        path: `/${type.faction}/${forceUser.name}/`,
        component: type.template,
        context: {
          name: forceUser.name,
          previousPostName,
          nextPostName,
        },
      })
    })
  })
}
