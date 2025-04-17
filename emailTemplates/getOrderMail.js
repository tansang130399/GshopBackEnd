const fs = require('fs');
const path = require('path');

const getOrderMail = (userName, orderID, status, paymentName, orderDetails, orderInfo) => {
    const templatePath = path.join(__dirname, "contentOrderMail.html");
    let html = fs.readFileSync(templatePath, "utf8");

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

    return html;
};

module.exports = getOrderMail;