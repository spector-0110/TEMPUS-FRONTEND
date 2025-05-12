
export default function HelpPage() {

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Help & Support</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <PhoneIcon className="h-8 w-8 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Contact Support</h3>
          <p className="text-muted-foreground mb-2">Need immediate assistance? Our support team is here to help.</p>
          <p className="font-medium">+1 (555) 123-4567</p>
        </Card>
        
        <Card className="p-6">
          <MailIcon className="h-8 w-8 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Email Support</h3>
          <p className="text-muted-foreground mb-2">Send us an email and we'll get back to you within 24 hours.</p>
          <p className="font-medium">support@tempus.com</p>
        </Card>
        
        <Card className="p-6">
          <BookIcon className="h-8 w-8 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Documentation</h3>
          <p className="text-muted-foreground mb-2">Browse our comprehensive documentation and guides.</p>
          <a href="#" className="text-primary hover:underline font-medium">View Documentation →</a>
        </Card>
      </div>
    </div>
  );
}
