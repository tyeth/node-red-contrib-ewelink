const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const helper = require('node-red-node-test-helper');
const credentialsNode = require('../src/credentials/credentials');
const temperatureNode = require('../src/temperature/temperature');
const eWeLinkConnect = require('../src/utils/ewelink-connect');

describe('Temperature Node', () => {
  beforeEach(done => {
    helper.startServer(done);
  });

  afterEach(done => {
    try {
      eWeLinkConnect.ready.restore();
      connection.getDeviceCurrentTemperature.restore();

      eWeLinkConnect.restore();
      methodStub.restore();
      readyStub.restore();
    } catch { }

    helper.unload().then(() => {
      helper.stopServer(done);
    });
  });

  it('should be loaded', done => {
    const flow = [
      { id: 'n1', type: 'ewelink-credentials' },
      { id: 'n2', type: 'ewelink-temperature', auth: 'n1', deviceId: '12345', name: 'Device 123' }
    ];
    helper.load([credentialsNode, temperatureNode], flow, () => {
      const n2 = helper.getNode('n2');

      n2.should.have.property('name', 'Device 123');

      done();
    });
  });

  it('should return the result of the getDeviceCurrentTemperature call with configured deviceid', done => {
    const connection = { getDeviceCurrentTemperature() { } };

    const methodStub = sinon.stub(connection, 'getDeviceCurrentTemperature')
      .callsFake(() => Promise.resolve({ methodResult: 'great' }));

    const readyStub = sinon.stub(eWeLinkConnect, 'ready')
      .callsFake(() => Promise.resolve(connection));
    const flow = [
      { id: 'n1', type: 'ewelink-credentials' },
      { id: 'n2', type: 'ewelink-temperature', auth: 'n1', deviceId: '12345', wires: [['n4']] },
      { id: 'n3', type: 'helper', wires: [['n2']] },
      { id: 'n4', type: 'helper' }
    ];
    helper.load([credentialsNode, temperatureNode], flow, () => {
      const n2 = helper.getNode('n2');
      const n3 = helper.getNode('n3');
      const n4 = helper.getNode('n4');

      setTimeout(() => {
        n2.on('input', () => {
          sinon.assert.calledWith(methodStub, '12345');
          sinon.assert.calledOnce(readyStub);



          n4.on('input', msg => {
            expect(msg).to.deep.include({ payload: { methodResult: 'great' } });
            done();

          });
        });

        n3.send({ payload: '' });
      });
    });
  });


  it('should return error if not supplied or configured with deviceid', done => {
    const connection = { getDeviceCurrentTemperature() { } };

    const methodStub = sinon.stub(connection, 'getDeviceCurrentTemperature')
      .callsFake(() => Promise.resolve({ methodResult: 'great' }));

    const readyStub = sinon.stub(eWeLinkConnect, 'ready')
      .callsFake(() => Promise.resolve(connection));
    const flow = [
      { id: 'n1', type: 'ewelink-credentials' },
      { id: 'n2', type: 'ewelink-temperature', auth: 'n1', deviceId: '', wires: [['n4']] },
      { id: 'n3', type: 'helper', wires: [['n2']] },
      { id: 'n4', type: 'helper' }
    ];
    helper.load([credentialsNode, temperatureNode], flow, () => {
      const n2 = helper.getNode('n2');
      const n3 = helper.getNode('n3');
      const n4 = helper.getNode('n4');

      setTimeout(() => {
        n2.on('input', () => {
          sinon.assert.calledWith(methodStub, '');

          n4.on('input', msg => {
            console.log(msg);
            throw Exception('No input expected to node, fail test');

          });
          setTimeout(() => done(), 300);
        });

        n3.send({ payload: '' });
      });
    });
  });

  it('should return the result of the getDeviceCurrentTemperature call with injected deviceid', done => {
    const connection = { getDeviceCurrentTemperature() { } };

    const methodStub = sinon.stub(connection, 'getDeviceCurrentTemperature')
      .callsFake(() => Promise.resolve({ methodResult: 'great' }));

    const readyStub = sinon.stub(eWeLinkConnect, 'ready')
      .callsFake(() => Promise.resolve(connection));
    const flow = [
      { id: 'n1', type: 'ewelink-credentials' },
      { id: 'n2', type: 'ewelink-temperature', auth: 'n1', deviceId: '', wires: [['n4']] },
      { id: 'n3', type: 'helper', wires: [['n2']] },
      { id: 'n4', type: 'helper' }
    ];
    helper.load([credentialsNode, temperatureNode], flow, () => {
      const n2 = helper.getNode('n2');
      const n3 = helper.getNode('n3');
      const n4 = helper.getNode('n4');

      setTimeout(() => {
        n2.on('input', () => {
          sinon.assert.calledWith(methodStub, '54321');
          sinon.assert.calledOnce(readyStub);



          n4.on('input', msg => {
            expect(msg).to.deep.include({ payload: { methodResult: 'great' } });
            done();

          });
        });

        n3.send({ payload: '54321' });
      });
    });
  });

  it('should prefer configured deviceid over injected deviceid', done => {
    const connection = { getDeviceCurrentTemperature() { } };

    const methodStub = sinon.stub(connection, 'getDeviceCurrentTemperature')
      .callsFake(() => Promise.resolve({ methodResult: 'great' }));

    const readyStub = sinon.stub(eWeLinkConnect, 'ready')
      .callsFake(() => Promise.resolve(connection));
    const flow = [
      { id: 'n1', type: 'ewelink-credentials' },
      { id: 'n2', type: 'ewelink-temperature', auth: 'n1', deviceId: '10001', wires: [['n4']] },
      { id: 'n3', type: 'helper', wires: [['n2']] },
      { id: 'n4', type: 'helper' }
    ];
    helper.load([credentialsNode, temperatureNode], flow, () => {
      const n2 = helper.getNode('n2');
      const n3 = helper.getNode('n3');
      const n4 = helper.getNode('n4');

      setTimeout(() => {
        n2.on('input', () => {
          sinon.assert.calledWith(methodStub, '10001');
          sinon.assert.calledOnce(readyStub);



          n4.on('input', msg => {
            done();

          });
        });

        n3.send({ payload: '54321' });
      });
    });
  });

});
