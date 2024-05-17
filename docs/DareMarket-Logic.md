

# Currency Manager

Quản lý các currency của marketplace

Việc thêm / xoá / check 1 token ERC20 mới được support cho marketplace được thực hiện thông qua hàm addCurrency / removeCurrency / isCurrencyWhitelisted


# Transfer

Thực hiện chuyển token cho marketplace thực thi logic có 2 trường hợp:

ERC20 / Native:

    - Thực tiếp thông qua việc approve cho spender = VemoMarket
    - Với native token: thực thi qua việc gắn currency là VemoMarket.WETH(), hàm buy sẽ thực hiện check balance WETH của user nếu còn dư thì sẽ thực hiện deposit native token để mint ra WETH tương ứng cho account. Số WETH mint được lấy từ msg.value của lời gọi hàm. 
    - Chỉ thực hiện buy với native, offer không hỗ trợ offer với native token

ERC1155 / 721:

    - Tuỳ từng loại NFT / SFT tương tác mà approve address tương ứng là TransferManagerERC721 / TransferManagerERC1155 / TransferManagerNonCompliantERC721
    - TransferManagerNonCompliantERC721 hiếm gặp nhưng được sử dụng cho các NFT không hỗ trợ hàm safeTransferFrom mà sử dụng hàm transferFrom (Các NFT đã mint từ thời CryptoKitty có thể thuộc loại này)


# Strategies

- Việc khớp lệnh dựa trên các strategy với nhiệm vụ validate các match. Các strategy thuần tuý chỉ trả về kết quả cho phép - không cho phép thực thi 1 match bất kỳ.

    - StrategyStandardSaleForFixedPrice: Mua bán NFT thông thường
    - StrategyStandardSaleForFixedPriceDNFT: Mua bán NFT nhưng có validate về thời gian. Nếu NFT là DNFT, được kiểm tra bằng việc check interface của NFT thông qua chuẩn 165 sẽ gọi hàm để check expireTime để check cho phép - không cho phép thực hiện lệnh mua bán NFT tương ứng.

# Ý tưởng

- VemoMarket sẽ sử dụng backend + nonce để sinh ra signature + payload tương ứng cho bên A (Maker: người tạo lệnh bán / offer)
- Taker (người mua / người chấp thuận lệnh offer) sẽ thực thi trên blockchain.

- Việc mua bán đã được chuẩn hoá về các hàm dễ sử dụng được thực hiện tại marketplace-sdk.
Trong đó:

    + matchAskWithTakerBid: Khớp lệnh với taker là người bid (người trả tiền) => maker là người ask, đây là giao dịch list trước - mua sau
    + matchBidWithTakerAsk: Taker là người ask, tức người maker sẽ trả tiền => giao dịch offer, người mua sẽ đưa ra mức giá tiền cho vật phẩm - người chủ sở hữu match yêu cầu này (takerAsk)


