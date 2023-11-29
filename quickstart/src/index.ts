import { config } from "dotenv"
import { IBundler, Bundler } from '@biconomy/bundler'
import {  BiconomySmartAccountV2, DEFAULT_ENTRYPOINT_ADDRESS } from "@biconomy/account"
import { ethers } from 'ethers'
import { ChainId } from "@biconomy/core-types"
import { ECDSAOwnershipValidationModule, DEFAULT_ECDSA_OWNERSHIP_MODULE } from "@biconomy/modules";

config();
const bundler: IBundler = new Bundler({
    bundlerUrl: 'https://bundler.biconomy.io/api/v2/80001/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44',     
    chainId: ChainId.POLYGON_MUMBAI,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  });

const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/polygon_mumbai")
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "", provider);

async function createAccount() {

    const module = await ECDSAOwnershipValidationModule.create({
      signer: wallet,
      moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE
    })
  
    let biconomySmartAccount = await BiconomySmartAccountV2.create({
    chainId: ChainId.POLYGON_MUMBAI,
    bundler: bundler, 
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
    defaultValidationModule: module,
    activeValidationModule: module,
    accountAddress: '0xA026baC84147FBd2C80eb6686114b02e800AEc5F'
  })
    console.log("address: ", await biconomySmartAccount.getAccountAddress())
    return biconomySmartAccount;
  }
  
  async function createTransaction() {
    const smartAccount = await createAccount();

    try {
      const transaction = {
        to: '0xd69BddCf538da91f66EE165C6244f59122C1Ff52',
        data: '0x',
        value: ethers.utils.parseEther('0.1'),
      }
    
      const userOp = await smartAccount.buildUserOp([transaction])
      userOp.paymasterAndData = "0x"
    
      const userOpResponse = await smartAccount.sendUserOp(userOp)
    
      const transactionDetail = await userOpResponse.wait()
    
      console.log("transaction detail below")
      console.log(`https://mumbai.polygonscan.com/tx/${transactionDetail.receipt.transactionHash}`)
    } catch (error) {
      console.log(error)
    }
  }
  
  createTransaction()