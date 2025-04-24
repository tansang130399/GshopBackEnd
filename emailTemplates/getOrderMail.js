const fs = require('fs');
const path = require('path');

const getOrderMail = (userName, orderID, status, paymentName, orderDetails, orderInfo) => {
    const templatePath = path.join(__dirname, "contentOrderMail.html");
    let html = fs.readFileSync(templatePath, "utf8");
    let statusContent = "";

    if (status == "Đã hủy") {
        statusContent = `
        <p id="cancellationMessage" class="thank-you">
            Chúng tôi rất tiếc phải thông báo rằng đơn hàng <strong>#${orderID}</strong> đã bị
            <strong style="color: #E43727;">Hủy</strong> do một số lý do ngoài ý muốn.<br />
            GShop chân thành <strong>xin lỗi</strong> vì sự bất tiện này. Nếu bạn đã thanh toán trước, chúng tôi sẽ hoàn
            tiền trong vòng <strong>3-5 ngày làm việc</strong>.<br />
            Rất mong tiếp tục được phục vụ bạn trong tương lai.
        </p>
    `;
    } else if (status == "Đã giao") {
        statusContent = `
        <p class="greeting">
            Chúc mừng đơn hàng <strong>#${orderID}</strong> của bạn đã được vận chuyển thành công,
            chúc bạn có trải nghiệm tuyệt vời với sản phẩm của cửa hàng chúng tôi.
        </p>
    `;
    } else if (status == "Đang giao hàng") {
        statusContent = `
        <p class="greeting">
            Đơn hàng <strong>#${orderID}</strong> của bạn đã được xử lý thành công,
            và sẽ được vận chuyển đến địa chỉ ${orderInfo?.address} trong vòng 2 hoặc 3 ngày tới.
        </p>
    `;
    } else {
        statusContent = `
        <p class="greeting">
            Rất cảm ơn bạn đã mua hàng tại GShop chúng tôi. Đơn hàng <strong>#${orderID}</strong>
            của bạn sẽ được xử lý trong thời gian sớm nhất có thể.
        </p>
    `;
    }

    // Tạo HTML từ mảng chi tiết đơn hàng
    const detailsHTML = orderDetails.map(detail => {
        return `
            <tr>
                <td>
                    ${detail.productImage ? `<img src="${detail.productImage}" alt="${detail.productName}" width="100%" height="140" style="object-fit: cover;"/>` : ''}
                </td>
                <td>${detail.productName}</td>
                <td style="text-align: center;">${detail.quantity}</td>
                <td>${detail.unit_price.toLocaleString()} VND</td>
            </tr>
        `;
    }).join("");

    html = html
        .replace(/{{userName}}/g, userName)
        .replace(/{{orderID}}/g, orderID)
        .replace(/{{status}}/g, status)
        .replace(/{{paymentName}}/g, paymentName)
        .replace(/{{orderDetails}}/g, detailsHTML)

        .replace(/{{receiverName}}/g, orderInfo?.name)
        .replace(/{{receiverPhone}}/g, orderInfo?.phone)
        .replace(/{{receiverAddress}}/g, orderInfo?.address)
        .replace(/{{orderDate}}/g, orderInfo?.date)
        .replace(/{{orderTime}}/g, orderInfo?.time)
        .replace(/{{shippingFee}}/g, orderInfo?.shipping_fee.toLocaleString())
        .replace(/{{totalPrice}}/g, orderInfo?.productTotal.toLocaleString())
        .replace(/{{finalPrice}}/g, orderInfo?.total_price.toLocaleString())
        .replace(/{{statusContent}}/g, statusContent);

    return html;
};

module.exports = getOrderMail;