import graphql from 'babel-plugin-relay/macro'
import {fetchQuery} from 'relay-runtime'
import Atmosphere from '../../Atmosphere'
import {getDemoEntitiesQuery} from '__generated__/getDemoEntitiesQuery.graphql'
import PROD from 'parabol-server/PROD';

const query = graphql`
  query getDemoEntitiesQuery($text: String!) {
    getDemoEntities(text: $text) {
      entities {
        lemma
        name
        salience
      }
    }
  }
`
const demoLookup = (text) => {
  return [{name: text, salience: 1, lemma: text}]
}

const getDemoEntities = async (text: string) => {
  if (!text || text.length <= 2) return []
  const remoteAtmosphere = new Atmosphere()
  if(!PROD){
    const lookupEntities = demoLookup(text)
    return lookupEntities || []
  }
  const res = await fetchQuery<getDemoEntitiesQuery>(remoteAtmosphere, query, {text})
  const {getDemoEntities} = res
  const {entities} = getDemoEntities
  return entities || []
}

export default getDemoEntities
