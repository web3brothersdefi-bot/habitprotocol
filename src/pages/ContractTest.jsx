/**
 * Contract Test Page
 * Direct contract interaction to verify everything works
 */

import React, { useState } from 'react';
import { useAccount, useReadContract, usePublicClient } from 'wagmi';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { CONTRACT_ADDRESS, STAKE_MATCH_ABI } from '../config/wagmi';

const ContractTest = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  
  const [testAddress, setTestAddress] = useState('');
  const [stakeResult, setStakeResult] = useState(null);
  const [eventLogs, setEventLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Test 1: Query stake status directly
  const checkStakeStatus = async () => {
    if (!testAddress || !address) return;
    
    setLoading(true);
    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: STAKE_MATCH_ABI,
        functionName: 'getStakeStatus',
        args: [testAddress, address]
      });

      const [status, amount, timestamp] = result;
      setStakeResult({
        from: testAddress,
        to: address,
        status: Number(status),
        statusText: ['None', 'Pending', 'Matched', 'Refunded', 'Released'][Number(status)],
        amount: amount.toString(),
        timestamp: timestamp.toString(),
        date: new Date(Number(timestamp) * 1000).toLocaleString()
      });
    } catch (error) {
      console.error('Error querying stake:', error);
      setStakeResult({ error: error.message });
    }
    setLoading(false);
  };

  // Test 2: Query events
  const checkEvents = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = currentBlock - BigInt(100000);

      console.log('Querying events:', {
        contract: CONTRACT_ADDRESS,
        fromBlock: fromBlock.toString(),
        currentBlock: currentBlock.toString(),
        myAddress: address
      });

      // Query incoming stakes
      const incomingLogs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: {
          type: 'event',
          name: 'Staked',
          inputs: [
            { indexed: true, name: 'from', type: 'address' },
            { indexed: true, name: 'to', type: 'address' },
            { indexed: false, name: 'amount', type: 'uint256' },
            { indexed: false, name: 'timestamp', type: 'uint256' }
          ]
        },
        args: {
          to: address
        },
        fromBlock
      });

      // Query outgoing stakes
      const outgoingLogs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: {
          type: 'event',
          name: 'Staked',
          inputs: [
            { indexed: true, name: 'from', type: 'address' },
            { indexed: true, name: 'to', type: 'address' },
            { indexed: false, name: 'amount', type: 'uint256' },
            { indexed: false, name: 'timestamp', type: 'uint256' }
          ]
        },
        args: {
          from: address
        },
        fromBlock
      });

      setEventLogs([
        ...incomingLogs.map(log => ({ ...log, direction: 'incoming' })),
        ...outgoingLogs.map(log => ({ ...log, direction: 'outgoing' }))
      ]);

      console.log('Found logs:', {
        incoming: incomingLogs.length,
        outgoing: outgoingLogs.length
      });
    } catch (error) {
      console.error('Error querying events:', error);
      setEventLogs([{ error: error.message }]);
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Contract Test</h1>
          <p className="text-grey">Debug contract interactions</p>
        </div>

        {/* Contract Info */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Contract Info</h3>
          <div className="space-y-2 text-sm font-mono">
            <p><strong>Contract:</strong> {CONTRACT_ADDRESS}</p>
            <p><strong>Your Address:</strong> {address || 'Not connected'}</p>
            <p><strong>Network:</strong> Base Sepolia (84532)</p>
          </div>
          <div className="mt-4">
            <a
              href={`https://sepolia.basescan.org/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View on BaseScan →
            </a>
          </div>
        </Card>

        {/* Test 1: Check Stake Status */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Test 1: Check Stake Status</h3>
          <p className="text-sm text-grey mb-4">
            Query contract storage directly to see if a stake exists
          </p>
          
          <div className="space-y-4">
            <Input
              label="Check if this address staked to you"
              value={testAddress}
              onChange={(e) => setTestAddress(e.target.value)}
              placeholder="0x..."
            />
            
            <Button onClick={checkStakeStatus} disabled={loading || !testAddress}>
              Check Stake Status
            </Button>

            {stakeResult && (
              <div className="mt-4 p-4 bg-dark-light rounded-xl">
                <h4 className="font-bold mb-2">Result:</h4>
                {stakeResult.error ? (
                  <p className="text-red-400">{stakeResult.error}</p>
                ) : (
                  <div className="space-y-1 text-sm">
                    <p><strong>Status:</strong> {stakeResult.statusText} ({stakeResult.status})</p>
                    <p><strong>Amount:</strong> {stakeResult.amount} (1 USDC = 1000000)</p>
                    <p><strong>Timestamp:</strong> {stakeResult.timestamp}</p>
                    <p><strong>Date:</strong> {stakeResult.date}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Test 2: Check Events */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Test 2: Check Events</h3>
          <p className="text-sm text-grey mb-4">
            Query blockchain events to see all stakes involving your address
          </p>
          
          <Button onClick={checkEvents} disabled={loading}>
            Query Events
          </Button>

          {eventLogs.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-bold">Found {eventLogs.length} events:</h4>
              {eventLogs.map((log, i) => (
                <div key={i} className="p-4 bg-dark-light rounded-xl text-sm">
                  {log.error ? (
                    <p className="text-red-400">{log.error}</p>
                  ) : (
                    <div>
                      <p><strong>Direction:</strong> {log.direction}</p>
                      <p><strong>From:</strong> {log.args?.from}</p>
                      <p><strong>To:</strong> {log.args?.to}</p>
                      <p><strong>Amount:</strong> {log.args?.amount?.toString()}</p>
                      <p><strong>Timestamp:</strong> {log.args?.timestamp?.toString()}</p>
                      <p><strong>Block:</strong> {log.blockNumber?.toString()}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Instructions */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">How to Test</h3>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Step 1: Make a test stake</h4>
              <ol className="list-decimal list-inside space-y-1 text-grey">
                <li>Go to Dashboard</li>
                <li>Swipe right on a user</li>
                <li>Approve USDC and stake</li>
                <li>Wait for transaction to confirm</li>
                <li>Note the target address</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Step 2: Test with that address</h4>
              <ol className="list-decimal list-inside space-y-1 text-grey">
                <li>Paste target address in "Test 1"</li>
                <li>Click "Check Stake Status"</li>
                <li>Should show: Status = Pending (1)</li>
                <li>If shows "None" → Stake didn't work</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Step 3: Check events</h4>
              <ol className="list-decimal list-inside space-y-1 text-grey">
                <li>Click "Query Events"</li>
                <li>Should show outgoing stake event</li>
                <li>If shows 0 events → Event query issue</li>
                <li>Check console for details</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default ContractTest;
