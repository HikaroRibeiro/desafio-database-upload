import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionRepository from '../repositories/TransactionsRepository';
import {getCustomRepository, getRepository} from 'typeorm';

interface RequestDTO{
  title:string,
  category: string,
  type: 'income' | 'outcome',
  value: number,
}


class CreateTransactionService {
  public async execute({title,category,type,value}:RequestDTO): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    const {total} = await transactionRepository.getBalance();

    if( type === "outcome" && total < value){
      throw new AppError("You do not have enough balance.");
    }

    let transactionCategory = await categoryRepository.findOne({
      where: { 
        title: category,
      }
    })

    if(!transactionCategory){
      transactionCategory = categoryRepository.create({
        title:category,
      })
      await categoryRepository.save(transactionCategory);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category:transactionCategory,
    })

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
