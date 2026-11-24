import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mi_rates_backend.settings')
django.setup()

from decimal import Decimal
from django.core.files.base import ContentFile
from rates.models import MiProductRate


def create_sample_pdf(service_name, rate_str):
    """
    Creates a minimal valid PDF-1.4 file for testing attachments
    """
    pdf_text = f"""%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 220 >> stream
BT
/F1 16 Tf
50 720 Td
(SLTMobitel Enterprise Telecommunication Services) Tj
/F1 12 Tf
0 -30 Td
(Product: {service_name}) Tj
0 -20 Td
(Official Commercial Rate: LKR {rate_str}) Tj
0 -20 Td
(Approval: Authorized by General Manager - Enterprise Business) Tj
ET
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000514 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
585
%%EOF"""
    return pdf_text.encode('latin1')


sample_records = [
    {
        'service': 'Dedicated Internet Access (DIA) 100Mbps',
        'executive_level': 'Enterprise Platinum',
        'rate': Decimal('185000.00'),
        'created_user': 'slt_admin',
        'status': 'Active',
        'comments': 'High-bandwidth symmetric leased line with 99.95% SLA guarantee',
        'filename': 'DIA_100Mbps_Rate_Card.pdf',
    },
    {
        'service': 'MPLS IP-VPN Corporate Multi-Branch',
        'executive_level': 'Tier 1 Executive',
        'rate': Decimal('95000.50'),
        'created_user': 'anushka_intern',
        'status': 'Active',
        'comments': 'Secure inter-branch connectivity for Colombo, Kandy, and Galle branches',
        'filename': 'MPLS_VPN_Specification.pdf',
    },
    {
        'service': 'Cloud Connect ExpressRoute (Azure/AWS)',
        'executive_level': 'Enterprise Gold',
        'rate': Decimal('240000.00'),
        'created_user': 'cloud_specialist',
        'status': 'Active',
        'comments': 'Direct private fiber interconnect to hyperscaler cloud zones',
        'filename': 'Cloud_Connect_Approval.pdf',
    },
    {
        'service': 'SIP Trunking 30 Channels',
        'executive_level': 'Silver Tier',
        'rate': Decimal('45000.00'),
        'created_user': 'telecom_sales',
        'status': 'Inactive',
        'comments': 'Legacy voice trunking commercial rate card pending Q1 review',
        'filename': None,
    },
    {
        'service': 'SD-WAN Managed Edge Gateway',
        'executive_level': 'Enterprise Platinum',
        'rate': Decimal('160000.00'),
        'created_user': 'net_admin',
        'status': 'Active',
        'comments': 'Next-gen hybrid WAN routing with centralized Fortinet SD-WAN controller',
        'filename': 'SD_WAN_Edge_Rate.pdf',
    },
    {
        'service': 'Metro Ethernet 50Mbps Point-to-Point',
        'executive_level': 'Bronze Tier',
        'rate': Decimal('55000.75'),
        'created_user': 'anushka_intern',
        'status': 'Inactive',
        'comments': 'Discontinued promotional regional tariff for bank branches',
        'filename': None,
    },
    {
        'service': 'Tier III Colocation Space (42U Rack)',
        'executive_level': 'Enterprise Tier 3',
        'rate': Decimal('320000.00'),
        'created_user': 'datacenter_ops',
        'status': 'Active',
        'comments': 'Pitipana Data Center rack with 5kVA redundant UPS power feeds',
        'filename': 'Colocation_SLA_Pricing.pdf',
    },
]


def run():
    print("Seeding records into Oracle Database table SIA_MI_PRODUCT_RATES...")
    created_list = []
    for item in sample_records:
        existing = MiProductRate.objects.filter(service=item['service']).first()
        if existing:
            print(f"Record already exists: {existing.sr_id} - {existing.service}")
            continue

        record = MiProductRate(
            service=item['service'],
            executive_level=item['executive_level'],
            rate=item['rate'],
            created_user=item['created_user'],
            status=item['status'],
            comments=item['comments']
        )
        record.save()

        if item['filename']:
            pdf_bytes = create_sample_pdf(item['service'], str(item['rate']))
            record.attachment.save(item['filename'], ContentFile(pdf_bytes), save=True)

        att_name = record.attachment.name if record.attachment else "None"
        print(f"Created: {record.sr_id} | {record.service} | LKR {record.rate:,.2f} | Status: {record.status} | Attachment: {att_name}")
        created_list.append(record)

    print(f"\nSuccessfully added {len(created_list)} new records.")
    print(f"Total records in SIA_MI_PRODUCT_RATES: {MiProductRate.objects.count()}")


if __name__ == '__main__':
    run()
