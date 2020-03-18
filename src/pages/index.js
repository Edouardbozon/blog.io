import { graphql, Link } from 'gatsby';
import React from 'react';

import Bio from '../components/bio';
import Layout from '../components/layout';
import SEO from '../components/seo';
import { rhythm } from '../utils/typography';

class BlogIndex extends React.Component {
  render() {
    const { data } = this.props;
    const { siteMetadata } = data.site;
    const siteTitle = siteMetadata.title;
    const { social, author } = siteMetadata;
    const blogPosts = data.allMarkdownRemark.edges;
    const instagramPosts = data.allInstaNode.edges;

    return (
      <Layout
        location={this.props.location}
        title={siteTitle}
        social={social}
        author={author}
      >
        <SEO title="All posts" />
        <Bio />
        <section style={{ marginTop: rhythm(2) }}>
          {blogPosts.map(({ node }) => {
            const title = node.frontmatter.title || node.fields.slug;
            return (
              <article
                key={node.fields.slug}
                style={{ marginTop: rhythm(1.6), marginBottom: rhythm(1.6) }}
              >
                <header>
                  <h3
                    style={{
                      marginTop: 0,
                      marginBottom: rhythm(1 / 4),
                    }}
                  >
                    <Link to={node.fields.slug}>{title}</Link>
                  </h3>
                  <span>{node.frontmatter.date}</span>
                </header>
              </article>
            );
          })}
        </section>
        <section
          style={{
            marginTop: rhythm(2),
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            alignContent: 'space-around',
          }}
        >
          {instagramPosts.map(({ node }) => (
            <a href={node.original} key={node.id} style={{ boxShadow: 'none' }}>
              <img
                style={{
                  maxWidth: 150,
                  maxHeight: 200,
                  margin: 0,
                }}
                src={node.preview}
                alt={node.caption}
              />
            </a>
          ))}
        </section>
      </Layout>
    );
  }
}

export default BlogIndex;

export const pageQuery = graphql`
  query {
    allInstaNode {
      edges {
        node {
          id
          preview
          original
          timestamp
          caption
        }
      }
    }
    site {
      siteMetadata {
        title
        author
        social {
          twitter
          github
          linkedin
        }
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
          }
        }
      }
    }
  }
`;
