using System;
using System.IO;
using API.Models.Entities;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace API.Services
{
    public class InvoiceDocument : IDocument
    {
        private readonly Invoice _invoice;

        public InvoiceDocument(Invoice invoice)
        {
            _invoice = invoice ?? throw new ArgumentNullException(nameof(invoice));
        }

        public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(30);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(12));

                page.Header().Element(ComposeHeader);
                page.Content().Element(ComposeContent);
                page.Footer().AlignCenter().Text("Thank you for your business").FontSize(10);
            });
        }

        void ComposeHeader(IContainer container)
        {
            var outlet = _invoice.Outlet;

            container.Row(row =>
            {
                row.RelativeItem().Column(col =>
                {
                    col.Item().Text(outlet.BusinessName).FontSize(18).SemiBold();
                    if (!string.IsNullOrEmpty(outlet.Street) || !string.IsNullOrEmpty(outlet.City))
                    {
                        col.Item().Text($"{outlet.Street}, {outlet.City}, {outlet.State} {outlet.Pincode}");
                    }
                    if (!string.IsNullOrEmpty(outlet.Phone)) col.Item().Text($"Phone: {outlet.Phone}");
                    if (!string.IsNullOrEmpty(outlet.Email)) col.Item().Text($"Email: {outlet.Email}");
                });

                row.ConstantItem(200).Column(col =>
                {
                    col.Item().AlignRight().Text("INVOICE").FontSize(18).SemiBold();
                    col.Item().AlignRight().Text($"# {_invoice.InvoiceNumber}");
                    col.Item().AlignRight().Text($"Date: {_invoice.CreatedAt:yyyy-MM-dd}");
                    if (_invoice.DueDate.HasValue)
                        col.Item().AlignRight().Text($"Due: {_invoice.DueDate:yyyy-MM-dd}");
                });
            });
        }

        void ComposeContent(IContainer container)
        {
            var order = _invoice.Order;

            container.Column(col =>
            {
                // Customer
                if (order?.Customer != null)
                {
                    col.Item().Text("Bill To:").SemiBold();
                    col.Item().Text(order.Customer.Name ?? string.Empty);
                    if (!string.IsNullOrEmpty(order.Customer.Phone)) col.Item().Text(order.Customer.Phone);
                    if (!string.IsNullOrEmpty(order.Customer.Email)) col.Item().Text(order.Customer.Email);
                    col.Item().PaddingBottom(10);
                }

                // Items table
                col.Item().Element(c => ComposeItemsTable(c));

                // Totals
                col.Item().PaddingTop(10).AlignRight().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.ConstantColumn(120);
                        columns.RelativeColumn();
                    });

                    table.Cell().Element(cell => cell.Text("Subtotal:").SemiBold());
                    table.Cell().Element(cell => cell.Text($"{_invoice.Subtotal:C}").AlignRight());

                    table.Cell().Element(cell => cell.Text("Tax:").SemiBold());
                    table.Cell().Element(cell => cell.Text($"{_invoice.TaxAmount:C}").AlignRight());

                    table.Cell().Element(cell => cell.Text("Discount:").SemiBold());
                    table.Cell().Element(cell => cell.Text($"{_invoice.DiscountAmount:C}").AlignRight());

                    table.Cell().Element(cell => cell.Text("Total:").SemiBold().FontSize(14));
                    table.Cell().Element(cell => cell.Text($"{_invoice.TotalAmount:C}").AlignRight().FontSize(14));
                });
            });
        }

        void ComposeItemsTable(IContainer container)
        {
            var items = _invoice.Order?.OrderItems ?? Array.Empty<API.Models.Entities.OrderItem>();

            container.Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(4);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                });

                // Header
                table.Header(header =>
                {
                    header.Cell().Element(CellStyle).Text("Item").SemiBold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Qty").SemiBold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Price").SemiBold();
                    header.Cell().Element(CellStyle).AlignRight().Text("Total").SemiBold();
                });

                // Rows
                foreach (var item in items)
                {
                    table.Cell().Element(CellStyle).Text(item.Name ?? string.Empty);
                    table.Cell().Element(CellStyle).AlignRight().Text(item.Quantity.ToString());
                    table.Cell().Element(CellStyle).AlignRight().Text(item.UnitPrice.ToString("C"));
                    table.Cell().Element(CellStyle).AlignRight().Text((item.UnitPrice * item.Quantity).ToString("C"));
                }
            });
        }

        static IContainer CellStyle(IContainer container)
        {
            return container.PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten3);
        }
    }
}
