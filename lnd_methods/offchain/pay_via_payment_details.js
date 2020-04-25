const asyncAuto = require('async/auto');
const {returnResult} = require('asyncjs-util');

const finishedPayment = require('./finished_payment');
const {isLnd} = require('./../../lnd_requests');
const subscribeToPayViaDetails = require('./subscribe_to_pay_via_details');

const isPublicKey = n => !!n && /^[0-9A-F]{66}$/i.test(n);
const method = 'sendPaymentV2';
const type = 'router';

/** Pay via payment details

  Requires LND built with `routerrpc` build tag on LND 0.9.2 and below

  If no id is specified, a random id will be used.

  Requires `offchain:write` permission

  Specifying `features` is not supported on LND 0.8.2 and below
  Specifying `max_fee_mtokens`/`mtokens` is not supported in LND 0.8.2 or below
  Specifying `messages` is not supported on LND 0.8.2 and below

  `incoming_peer` is not supported on LND 0.8.2 and below

  {
    [cltv_delta]: <Final CLTV Delta Number>
    destination: <Destination Public Key String>
    [features]: [{
      bit: <Feature Bit Number>
    }]
    [id]: <Payment Request Hash Hex String>
    [incoming_peer]: <Pay Through Specific Final Hop Public Key Hex String>
    lnd: <Authenticated LND API Object>
    [max_fee]: <Maximum Fee Tokens To Pay Number>
    [max_fee_mtokens]: <Maximum Fee Millitokens to Pay String>
    [max_timeout_height]: <Maximum Height of Payment Timeout Number>
    [messages]: [{
      type: <Message Type Number String>
      value: <Message Raw Value Hex Encoded String>
    }]
    [mtokens]: <Millitokens to Pay String>
    [outgoing_channel]: <Pay Out of Outgoing Channel Id String>
    [pathfinding_timeout]: <Time to Spend Finding a Route Milliseconds Number>
    routes: [[{
      [base_fee_mtokens]: <Base Routing Fee In Millitokens String>
      [channel]: <Standard Format Channel Id String>
      [cltv_delta]: <CLTV Blocks Delta Number>
      [fee_rate]: <Fee Rate In Millitokens Per Million Number>
      public_key: <Forward Edge Public Key Hex String>
    }]]
    [tokens]: <Tokens To Pay Number>
  }

  @returns via cbk or Promise
  {
    fee: <Total Fee Tokens Paid Rounded Down Number>
    fee_mtokens: <Total Fee Millitokens Paid String>
    hops: [{
      channel: <First Route Standard Format Channel Id String>
      channel_capacity: <First Route Channel Capacity Tokens Number>
      fee: <First Route Fee Tokens Rounded Down Number>
      fee_mtokens: <First Route Fee Millitokens String>
      forward_mtokens: <First Route Forward Millitokens String>
      public_key: <First Route Public Key Hex String>
      timeout: <First Route Timeout Block Height Number>
    }]
    id: <Payment Hash Hex String>
    mtokens: <Total Millitokens Paid String>
    paths: [{
      fee_mtokens: <Total Fee Millitokens Paid String>
      hops: [{
        channel: <First Route Standard Format Channel Id String>
        channel_capacity: <First Route Channel Capacity Tokens Number>
        fee: <First Route Fee Tokens Rounded Down Number>
        fee_mtokens: <First Route Fee Millitokens String>
        forward_mtokens: <First Route Forward Millitokens String>
        public_key: <First Route Public Key Hex String>
        timeout: <First Route Timeout Block Height Number>
      }]
      mtokens: <Total Millitokens Paid String>
    }]
    safe_fee: <Total Fee Tokens Paid Rounded Up Number>
    safe_tokens: <Total Tokens Paid, Rounded Up Number>
    secret: <Payment Preimage Hex String>
    timeout: <Expiration Block Height Number>
    tokens: <Total Tokens Paid Rounded Down Number>
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isPublicKey(args.destination)) {
          return cbk([400, 'ExpectedDestinationToPayViaDetails']);
        }

        if (!isLnd({method, type, lnd: args.lnd})) {
          return cbk([400, 'ExpectedAuthenticatedLndToPayViaDetails']);
        }

        return cbk();
      },

      // Pay
      pay: ['validate', ({}, cbk) => {
        try {
          const sub = subscribeToPayViaDetails({
            cltv_delta: args.cltv_delta,
            destination: args.destination,
            features: args.features,
            id: args.id,
            incoming_peer: args.incoming_peer,
            lnd: args.lnd,
            max_fee: args.max_fee,
            max_fee_mtokens: args.max_fee_mtokens,
            max_timeout_height: args.max_timeout_height,
            messages: args.messages,
            mtokens: args.mtokens,
            outgoing_channel: args.outgoing_channel,
            pathfinding_timeout: args.pathfinding_timeout,
            routes: args.routes,
            tokens: args.tokens,
          });

          const finished = (err, res) => {
            if (!!err) {
              return cbk(err);
            }

            return finishedPayment({
              confirmed: res.confirmed,
              failed: res.failed,
            },
            cbk);
          };

          sub.once('confirmed', confirmed => finished(null, {confirmed}));
          sub.once('error', err => finished(err));
          sub.once('failed', failed => finished(null, {failed}));
        } catch (err) {
          return cbk([400, err.message]);
        }

        return;
      }],
    },
    returnResult({reject, resolve, of: 'pay'}, cbk));
  });
};