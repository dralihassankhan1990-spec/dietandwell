import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart, CartItem, Product, User } from '../entities';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getCart(user: User): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ user });
      await this.cartRepository.save(cart);
    }

    return cart;
  }

  async addItem(user: User, addToCartDto: AddToCartDto): Promise<Cart> {
    const { productId, quantity, variantLabel } = addToCartDto;

    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let cart = await this.getCart(user);

    const normalizedVariant = variantLabel?.trim() || null;
    const selectedVariant = normalizedVariant
      ? product.variants?.find((variant) => variant.label === normalizedVariant)
      : null;
    if (normalizedVariant && !selectedVariant) {
      throw new BadRequestException('Selected product option is not available');
    }
    const unitPrice = Number(selectedVariant?.price ?? product.salePrice ?? product.price);

    let cartItem = cart.items?.find(
      (item) => item.product.id === productId && item.variantLabel === normalizedVariant,
    );

    if (cartItem) {
      // Stock check must cover the NEW total, not just the added quantity.
      if (product.stock < cartItem.quantity + quantity) {
        throw new BadRequestException('Insufficient stock');
      }
      cartItem.quantity += quantity;
      await this.cartItemRepository.save(cartItem);
    } else {
      if (product.stock < quantity) {
        throw new BadRequestException('Insufficient stock');
      }
      cartItem = this.cartItemRepository.create({
        cart,
        product,
        quantity,
        price: unitPrice,
        variantLabel: normalizedVariant,
      });
      await this.cartItemRepository.save(cartItem);
    }

    return this.getCart(user);
  }

  async updateItem(user: User, itemId: string, updateDto: UpdateCartItemDto): Promise<Cart> {
    const cart = await this.getCart(user);
    const cartItem = cart.items?.find(item => item.id === itemId);

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (cartItem.product.stock < updateDto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    cartItem.quantity = updateDto.quantity;
    await this.cartItemRepository.save(cartItem);

    return this.getCart(user);
  }

  async removeItem(user: User, itemId: string): Promise<Cart> {
    const cart = await this.getCart(user);
    const cartItem = cart.items?.find(item => item.id === itemId);

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemRepository.remove(cartItem);

    return this.getCart(user);
  }

  async clearCart(user: User): Promise<void> {
    const cart = await this.getCart(user);
    if (cart.items && cart.items.length > 0) {
      await this.cartItemRepository.remove(cart.items);
    }
  }
}
