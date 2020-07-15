const {test} = require('@alexbosworth/tap');

const decodeSerialized = require('./../../lnd_grpc/decode_serialized');

const tests = [
  {
    args: {
      serialized: '0201036c6e6402eb01030a10b99ebfe62d1ccf6a9e099bf9795ac56b1201301a160a0761646472657373120472656164120577726974651a130a04696e666f120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a140a086d616361726f6f6e120867656e65726174651a160a076d657373616765120472656164120577726974651a170a086f6666636861696e120472656164120577726974651a160a076f6e636861696e120472656164120577726974651a140a057065657273120472656164120577726974651a180a067369676e6572120867656e6572617465120472656164000006203214b3a271a3304fd21d6e395c3f67a66c321ae3a38d9186f36c718ae14a0b63',
    },
    description: 'A hex macaroon returns a decoded macaroon',
    expected: {
      decoded: '0201036c6e6402eb01030a10b99ebfe62d1ccf6a9e099bf9795ac56b1201301a160a0761646472657373120472656164120577726974651a130a04696e666f120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a140a086d616361726f6f6e120867656e65726174651a160a076d657373616765120472656164120577726974651a170a086f6666636861696e120472656164120577726974651a160a076f6e636861696e120472656164120577726974651a140a057065657273120472656164120577726974651a180a067369676e6572120867656e6572617465120472656164000006203214b3a271a3304fd21d6e395c3f67a66c321ae3a38d9186f36c718ae14a0b63',
    },
  },
  {
    args: {
      serialized: 'AgEDbG5kAusBAwoQuZ6/5i0cz2qeCZv5eVrFaxIBMBoWCgdhZGRyZXNzEgRyZWFkEgV3cml0ZRoTCgRpbmZvEgRyZWFkEgV3cml0ZRoXCghpbnZvaWNlcxIEcmVhZBIFd3JpdGUaFAoIbWFjYXJvb24SCGdlbmVyYXRlGhYKB21lc3NhZ2USBHJlYWQSBXdyaXRlGhcKCG9mZmNoYWluEgRyZWFkEgV3cml0ZRoWCgdvbmNoYWluEgRyZWFkEgV3cml0ZRoUCgVwZWVycxIEcmVhZBIFd3JpdGUaGAoGc2lnbmVyEghnZW5lcmF0ZRIEcmVhZAAABiAyFLOicaMwT9IdbjlcP2embDIa46ONkYbzbHGK4UoLYw==',
    },
    description: 'A base64 macaroon returns a decoded macaroon',
    expected: {
      decoded: '0201036c6e6402eb01030a10b99ebfe62d1ccf6a9e099bf9795ac56b1201301a160a0761646472657373120472656164120577726974651a130a04696e666f120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a140a086d616361726f6f6e120867656e65726174651a160a076d657373616765120472656164120577726974651a170a086f6666636861696e120472656164120577726974651a160a076f6e636861696e120472656164120577726974651a140a057065657273120472656164120577726974651a180a067369676e6572120867656e6572617465120472656164000006203214b3a271a3304fd21d6e395c3f67a66c321ae3a38d9186f36c718ae14a0b63',
    },
  },
  {
    args: {},
    description: 'No macaroon returns nothing',
    expected: {},
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, async ({end, equal}) => {
    const {decoded} = expected;
    const res = decodeSerialized(args);

    if (!!decoded) {
      equal(res.decoded.toString('hex'), decoded, 'Got decoded data');
    } else {
      equal(res.decoded, undefined, 'No decoded data');
    }

    return end();
  });
});
