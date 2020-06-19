import React from "react";
import { API, graphqlOperation } from 'aws-amplify';
import { onCreateMarket } from '../graphql/subscriptions';
import { Loading, Card, Icon, Tag } from "element-react";
import { Link } from 'react-router-dom';

//Everything should work with standard queries generated from the schema.
//But probably in new versions of Amplify it works differently, so I slightly changed the standard request.
const myListMarkets = /* GraphQL */ `
  query ListMarkets(
    $filter: ModelMarketFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMarkets(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        products {
          items {
            id
          }
          nextToken
        }
        tags
        owner
        createdAt
      }
      nextToken
    }
  }
`;

class MarketList extends React.Component {

  state = {
    listMarkets: [],
    isLoading: true,
  }

  componentDidMount() {
    this.handleMarketsList();

    this.createMarketListener = API.graphql(graphqlOperation(onCreateMarket))
      .subscribe({
        next: marketData => {
          const createdMarket = marketData.value.data.onCreateMarket;
          const prevMarkets = this.state.listMarkets.filter(
            item => item.id !== createdMarket.id
          )
          const updatedmarkets = [createdMarket, ...prevMarkets]

          this.setState({ listMarkets: updatedmarkets })
        }
      })
  }

  componentWillUnmount() {
    this.createMarketListener.unsubscribe();
  }

  handleMarketsList = async () => {
    const result = await API.graphql(graphqlOperation(myListMarkets));
    this.setState({ listMarkets: result.data.listMarkets.items, isLoading: false });
  }

  render() {
    const { listMarkets, isLoading } = this.state;
    const { searchResults } = this.props;

    if (isLoading) return <Loading fullscreen={true} />

    const markets =
      searchResults.length > 0
        ? searchResults
        : listMarkets;

    return (
      <>
        {searchResults.length > 0
          ? (
            <h2 className='text-green'>
              <Icon type='success' name='check' className='icon' />
              {searchResults.length} Results
            </h2>
          ) : (
            < h2 className="header">
              <img src="https://icon.now.sh/store_mall_directory/527FFF" alt="Store Icon" className="large-icon" />
                Markets
            </h2>
          )
        }

        {markets.map(market => (
          <div key={market.id} className='my-2'>
            <Card
              bodyStyle={{
                padding: "0.7em",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span className='flex'>
                  <Link className='link' to={`/markets/${market.id}`}>
                    {market.name}
                  </Link>
                  <span style={{ color: 'var(--darkAmazonOrange' }}>
                    {market.products.items
                      ? market.products.items.length
                      : 0}
                  </span>
                  <img src="https://icon.now.sh/shopping_cart/f60" alt="Shopping Cart" />
                </span>
                <div style={{ color: 'var(--lightSquidInk)' }}>
                  {market.owner}
                </div>
              </div>
              <div>
                {market.tags && market.tags.map(tag => (
                  <Tag key={tag} type='danger' className='mx-1'>
                    {tag}
                  </Tag>
                ))}
              </div>
            </Card>
          </div>
        ))}
      </>
    )
  }
};

export default MarketList;
