import {
  getEdition,
  programIds,
  getMetadata,
  findProgramAddress,
  VAULT_PREFIX,
  getEditionMarkPda,
  getAuctionExtended,
} from '@oyster/common';
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import BN from 'bn.js';
import { serialize } from 'borsh';

import {
  getAuctionKeys,
  getBidderKeys,
  RedeemParticipationBidV2Args,
  SCHEMA,
  getPrizeTrackingTicket,
} from '.';

export async function redeemParticipationBidV2(
  vault: PublicKey,
  safetyDepositTokenStore: PublicKey,
  destination: PublicKey,
  safetyDeposit: PublicKey,
  fractionMint: PublicKey,
  bidder: PublicKey,
  payer: PublicKey,
  metadata: PublicKey,
  masterEdition: PublicKey,
  originalMint: PublicKey,
  transferAuthority: PublicKey,
  acceptPaymentAccount: PublicKey,
  tokenPaymentAccount: PublicKey,
  newMint: PublicKey,
  edition: BN,
  instructions: TransactionInstruction[],
) {
  const PROGRAM_IDS = programIds();
  const store = PROGRAM_IDS.store;
  if (!store) {
    throw new Error('Store not initialized');
  }

  const { auctionKey, auctionManagerKey } = await getAuctionKeys(vault);
  const auctionDataExtended = await getAuctionExtended({
    auctionProgramId: PROGRAM_IDS.auction,
    resource: vault,
  });

  const { bidRedemption, bidMetadata } = await getBidderKeys(
    auctionKey,
    bidder,
  );

  const prizeTrackingTicket = await getPrizeTrackingTicket(
    auctionManagerKey,
    originalMint,
  );

  const newMetadata = await getMetadata(newMint);
  const newEdition = await getEdition(newMint);

  const editionMarkPda = await getEditionMarkPda(originalMint, edition);

  const vaultAuthority: PublicKey = (
    await findProgramAddress(
      [
        Buffer.from(VAULT_PREFIX),
        PROGRAM_IDS.vault.toBuffer(),
        vault.toBuffer(),
      ],
      PROGRAM_IDS.vault,
    )
  )[0];

  const value = new RedeemParticipationBidV2Args();
  const data = Buffer.from(serialize(SCHEMA, value));
  const keys = [
    {
      pubkey: auctionManagerKey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: safetyDepositTokenStore,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: destination,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: bidRedemption,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: safetyDeposit,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: vault,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: fractionMint,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: auctionKey,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: bidMetadata,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: bidder,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: payer,
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: PROGRAM_IDS.token,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: PROGRAM_IDS.vault,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: PROGRAM_IDS.metadata,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: store,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: transferAuthority,
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: acceptPaymentAccount,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: tokenPaymentAccount,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: prizeTrackingTicket,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: newMetadata,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: newEdition,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: masterEdition,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: newMint,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: editionMarkPda,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: bidder,
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: metadata,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: vaultAuthority,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: auctionDataExtended, isSigner: false, isWritable: false },
  ];

  instructions.push(
    new TransactionInstruction({
      keys,
      programId: PROGRAM_IDS.metaplex,
      data,
    }),
  );
}
